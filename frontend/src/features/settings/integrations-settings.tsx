"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type Integration = { id: string; name: string; category: string; description: string; initials: string; connected: boolean };

const initial: Integration[] = [
  { id: "shopify", name: "Shopify", category: "E-commerce", description: "Sync products and pull orders from your Shopify store.", initials: "Sh", connected: true },
  { id: "woocommerce", name: "WooCommerce", category: "E-commerce", description: "Keep WooCommerce stock in sync in real time.", initials: "Wo", connected: false },
  { id: "amazon", name: "Amazon Seller", category: "Marketplace", description: "Import FBA and merchant-fulfilled orders.", initials: "Am", connected: false },
  { id: "quickbooks", name: "QuickBooks", category: "Accounting", description: "Push purchase bills and sales invoices automatically.", initials: "QB", connected: true },
  { id: "xero", name: "Xero", category: "Accounting", description: "Sync inventory value and cost of goods sold.", initials: "Xe", connected: false },
  { id: "slack", name: "Slack", category: "Notifications", description: "Get low-stock and order alerts in a channel.", initials: "Sl", connected: false },
];

export function IntegrationsSettings() {
  const [items, setItems] = useState(initial);
  const [reveal, setReveal] = useState(false);
  const apiKey = "stk_demo_key_replace_with_real_api_key";

  const toggle = (id: string, connected: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, connected } : i)));
    const name = items.find((i) => i.id === id)?.name;
    toast.success(connected ? `${name} connected` : `${name} disconnected`);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((i) => (
          <Card key={i.id}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm font-semibold">
                  {i.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle>{i.name}</CardTitle>
                  <CardDescription>{i.category}</CardDescription>
                </div>
                {i.connected ? <Badge variant="secondary">Connected</Badge> : null}
              </div>
            </CardHeader>
            <CardContent className="flex-1 text-sm text-muted-foreground">{i.description}</CardContent>
            <CardFooter className="justify-between border-t pt-4 pb-4">
              <span className="text-sm">{i.connected ? "Syncing" : "Not connected"}</span>
              <Switch checked={i.connected} onCheckedChange={(c) => toggle(i.id, c)} aria-label={`Connect ${i.name}`} />
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4" /> API access
          </CardTitle>
          <CardDescription>Use this key to call the REST API from your own systems. Keep it secret.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input readOnly value={reveal ? apiKey : "stk_demo_" + "•".repeat(24)} className="font-mono" aria-label="API key" />
            <Button variant="outline" size="icon" onClick={() => setReveal((r) => !r)} aria-label={reveal ? "Hide key" : "Show key"}>
              {reveal ? <EyeOff /> : <Eye />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Copy key"
              onClick={() => navigator.clipboard.writeText(apiKey).then(() => toast.success("API key copied"))}
            >
              <Copy />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
