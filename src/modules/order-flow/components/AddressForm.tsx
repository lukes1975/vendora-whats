import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  phone: z.string().min(7, "Enter a valid phone"),
  address: z.string().min(6, "Enter delivery address"),
});

export type AddressFormValues = z.infer<typeof schema>;

export function AddressForm({
  defaultValues,
  onChange,
}: {
  defaultValues?: Partial<AddressFormValues>;
  onChange?: (values: AddressFormValues, isValid: boolean) => void;
}) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    const sub = form.watch(() => {
      const vals = form.getValues();
      onChange?.(vals, form.formState.isValid);
    });
    return () => sub.unsubscribe();
  }, [form, onChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Delivery details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ada" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. +2348012345678" inputMode="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery address</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Textarea rows={3} placeholder="Street, city, landmark" {...field} />
                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!navigator.geolocation) return;
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                const lat = pos.coords.latitude.toFixed(6);
                                const lng = pos.coords.longitude.toFixed(6);
                                const value = `${lat},${lng}`;
                                form.setValue("address", value, { shouldDirty: true, shouldValidate: true });
                                const vals = form.getValues();
                                onChange?.(vals, form.formState.isValid);
                              },
                              () => {
                                // ignore errors silently
                              },
                              { enableHighAccuracy: true, timeout: 8000 }
                            );
                          }}
                        >
                          Use my location
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
