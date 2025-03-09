import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertPassword, insertPasswordSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { encryptPassword } from "@/lib/encryption";
import { useToast } from "@/hooks/use-toast";
import PasswordStrength from "./ui/password-strength";

const categories = [
  "Social Media",
  "Email",
  "Banking",
  "Shopping",
  "Work",
  "Entertainment",
  "Other",
];

export default function PasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<InsertPassword>({
    resolver: zodResolver(insertPasswordSchema),
    defaultValues: {
      title: "",
      username: "",
      password: "",
      category: "Other",
      url: "",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertPassword) => {
      if (!user) throw new Error("Not authenticated");

      // Preprocess URL before submission
      const formattedData = {
        ...data,
        url: data.url ? (data.url.match(/^https?:\/\//) ? data.url : `https://${data.url}`) : null,
        notes: data.notes || null,
      };

      try {
        const encrypted = encryptPassword(formattedData.password, user.password);
        const res = await apiRequest("POST", "/api/passwords", {
          ...formattedData,
          encryptedPassword: encrypted,
        });
        return await res.json();
      } catch (error) {
        console.error('Encryption or submission error:', error);
        throw new Error('Failed to save password. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      toast({
        title: "Success",
        description: "Password saved successfully",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save passwords",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <PasswordStrength password={field.value} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Website URL (Optional)</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="e.g., example.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Password"}
        </Button>
      </form>
    </Form>
  );
}