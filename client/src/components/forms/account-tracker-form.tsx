import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const accountTrackerSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  startingCapital: z.number().min(100, "Starting capital must be at least $100"),
  maxDailyLoss: z.number().min(0.1).max(10, "Max daily loss must be between 0.1% and 10%"),
  maxOverallLoss: z.number().min(1).max(50, "Max overall loss must be between 1% and 50%"),
  profitTarget: z.number().min(5).max(100, "Profit target must be between 5% and 100%"),
});

type AccountTrackerFormData = z.infer<typeof accountTrackerSchema>;

interface AccountTrackerFormProps {
  onSuccess?: () => void;
}

export function AccountTrackerForm({ onSuccess }: AccountTrackerFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AccountTrackerFormData>({
    resolver: zodResolver(accountTrackerSchema),
    defaultValues: {
      name: "",
      startingCapital: 10000,
      maxDailyLoss: 2,
      maxOverallLoss: 10,
      profitTarget: 20,
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: AccountTrackerFormData) => {
      const response = await apiRequest("POST", "/api/account-trackers", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account tracker created",
        description: "Your new account tracker has been set up with a trading plan.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/account-trackers"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating account tracker",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AccountTrackerFormData) => {
    createAccountMutation.mutate(data);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Account Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Conservative Growth" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startingCapital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Capital ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="100"
                      placeholder="10000"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxDailyLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Daily Loss (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="2.0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxOverallLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Overall Loss (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="profitTarget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profit Target (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="20"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAccountMutation.isPending}>
                {createAccountMutation.isPending ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
