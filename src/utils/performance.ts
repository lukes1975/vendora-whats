// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number; loadTime: number };
        this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }

    // Navigation timing for FCP
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.firstContentfulPaint = navigation.loadEventEnd - navigation.fetchStart;
      }
    });
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  // Check if performance is good based on Core Web Vitals thresholds
  getPerformanceGrade(): 'good' | 'needs-improvement' | 'poor' {
    const { largestContentfulPaint, firstInputDelay, cumulativeLayoutShift } = this.metrics;

    const lcpGood = !largestContentfulPaint || largestContentfulPaint <= 2500;
    const fidGood = !firstInputDelay || firstInputDelay <= 100;
    const clsGood = !cumulativeLayoutShift || cumulativeLayoutShift <= 0.1;

    if (lcpGood && fidGood && clsGood) return 'good';
    
    const lcpPoor = largestContentfulPaint && largestContentfulPaint > 4000;
    const fidPoor = firstInputDelay && firstInputDelay > 300;
    const clsPoor = cumulativeLayoutShift && cumulativeLayoutShift > 0.25;

    if (lcpPoor || fidPoor || clsPoor) return 'poor';
    
    return 'needs-improvement';
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Image optimization utilities
export const optimizeImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
} = {}): string => {
  if (!url) return url;

  // If it's a Supabase storage URL, add optimization parameters
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const urlObj = new URL(url);
    
    if (options.width) urlObj.searchParams.set('width', options.width.toString());
    if (options.height) urlObj.searchParams.set('height', options.height.toString());
    if (options.quality) urlObj.searchParams.set('quality', options.quality.toString());
    if (options.format) urlObj.searchParams.set('format', options.format);
    
    return urlObj.toString();
  }

  return url;
};

// Lazy loading utility for non-image content
export const createIntersectionObserver = (
  callback: (isIntersecting: boolean) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  return new IntersectionObserver(
    ([entry]) => callback(entry.isIntersecting),
    {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    }
  );
};

// Bundle size analysis (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return;

  console.group('📦 Bundle Analysis');
  
  // Estimate JavaScript bundle size
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  let totalSize = 0;
  
  scripts.forEach(async (script) => {
    const src = script.getAttribute('src');
    if (src && !src.startsWith('http')) {
      try {
        const response = await fetch(src);
        const size = response.headers.get('content-length');
        if (size) {
          totalSize += parseInt(size);
          console.log(`${src}: ${(parseInt(size) / 1024).toFixed(2)} KB`);
        }
      } catch (error) {
        console.warn(`Could not analyze ${src}`);
      }
    }
  });

  setTimeout(() => {
    console.log(`Total estimated bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.groupEnd();
  }, 1000);
};

// Memory usage monitoring
export const getMemoryUsage = (): {
  used: number;
  total: number;
  percentage: number;
} | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }
  return null;
};

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Resource hints helpers
export const addPreloadLink = (href: string, as: string, type?: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  document.head.appendChild(link);
};

export const addPrefetchLink = (href: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

// Critical resource loading
export const preloadCriticalImages = (urls: string[]) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'image';
    document.head.appendChild(link);
  });
};