import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CURRENCY_PAIRS } from "@/lib/constants";

const tradeSchema = z.object({
  currencyPair: z.string().min(1, "Currency pair is required"),
  accountTrackerId: z.number().min(1, "Account tracker is required"),
  outcome: z.enum(["win", "loss"]),
  lotSize: z.number().min(0.01, "Lot size must be at least 0.01"),
  entryPrice: z.number().min(0.00001, "Entry price must be positive"),
  exitPrice: z.number().min(0.00001, "Exit price must be positive"),
  stopLoss: z.number().min(1, "Stop loss must be at least 1 pip"),
  takeProfit: z.number().min(1, "Take profit must be at least 1 pip"),
  tradeDateTime: z.string().min(1, "Trade date and time is required"),
  notes: z.string().optional(),
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface TradeEntryFormProps {
  onSuccess?: () => void;
}

export function TradeEntryForm({ onSuccess }: TradeEntryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      currencyPair: "",
      accountTrackerId: 0,
      outcome: "win",
      lotSize: 0.1,
      entryPrice: 0,
      exitPrice: 0,
      stopLoss: 20,
      takeProfit: 40,
      tradeDateTime: "",
      notes: "",
    },
  });

  const { data: accountTrackers } = useQuery({
    queryKey: ["/api/account-trackers"],
  });

  const createTradeMutation = useMutation({
    mutationFn: async (data: TradeFormData) => {
      const response = await apiRequest("POST", "/api/trades", {
        ...data,
        tradeDateTime: new Date(data.tradeDateTime).toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Trade added successfully",
        description: "Your trade has been recorded and account balance updated.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/account-trackers"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error adding trade",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TradeFormData) => {
    createTradeMutation.mutate(data);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currencyPair"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Pair</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency pair" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCY_PAIRS.map((pair) => (
                          <SelectItem key={pair} value={pair}>
                            {pair}
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
                name="accountTrackerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Tracker</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account tracker" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountTrackers?.map((tracker: any) => (
                          <SelectItem key={tracker.id} value={tracker.id.toString()}>
                            {tracker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="outcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trade Outcome</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="win">Win</SelectItem>
                        <SelectItem value="loss">Loss</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lotSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lot Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.5"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.00001"
                        placeholder="1.08532"
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
                name="exitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exit Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.00001"
                        placeholder="1.08782"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stopLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Loss (pips)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="20"
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
                name="takeProfit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Take Profit (pips)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="40"
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
              name="tradeDateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this trade..."
                      {...field}
                      rows={3}
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
              <Button type="submit" disabled={createTradeMutation.isPending}>
                {createTradeMutation.isPending ? "Adding..." : "Add Trade"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
