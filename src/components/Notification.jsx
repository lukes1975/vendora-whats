import { useState, useEffect } from "react";

// eslint-disable-next-line react/prop-types
const Notification = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide the notification after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      onClose(); // Remove from notification list
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    visible && (
      <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg transition-opacity duration-500">
        {message}
      </div>
    )
  );
};

export default Notification;
