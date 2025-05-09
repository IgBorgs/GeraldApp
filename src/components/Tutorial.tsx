import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";

interface TutorialProps {
  variant?: "default" | "outline";
  size?: "default" | "sm";
}

const Tutorial = ({ variant = "outline", size = "sm" }: TutorialProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <List className="h-4 w-4 mr-2" />
          View Tutorial
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerald's Prep List Tutorial</DialogTitle>
          <DialogDescription>
            Learn how to use Gerald's Prep List Generator effectively.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              1. Dashboard Overview
            </h3>
            <p className="text-muted-foreground">
              The dashboard provides a quick overview of your kitchen's prep
              status. You'll see:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>Critical items that need immediate attention</li>
              <li>Today's prep progress</li>
              <li>Inventory status by category</li>
              <li>Recent activity in your kitchen</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              2. Managing Inventory
            </h3>
            <p className="text-muted-foreground">
              The Inventory tab allows you to update your current stock levels:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>Enter the current quantity for each ingredient</li>
              <li>Use the search and filter options to find specific items</li>
              <li>The status column shows which items need attention</li>
              <li>Click "Save Inventory" when you're done</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              3. Setting PAR Levels
            </h3>
            <p className="text-muted-foreground">
              PAR levels represent the ideal stock level for each ingredient:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>Adjust PAR levels based on your kitchen's needs</li>
              <li>Higher PAR means more stock on hand</li>
              <li>Consider shelf life when setting PAR levels</li>
              <li>Seasonal adjustments may be necessary</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">4. Using Prep Lists</h3>
            <p className="text-muted-foreground">
              Prep lists are automatically generated based on the difference
              between current stock and PAR levels:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>Priority A: Critical items (25% or less of PAR)</li>
              <li>Priority B: Low items (50% or less of PAR)</li>
              <li>Priority C: Moderate items (below PAR but above 50%)</li>
              <li>Check off items as you complete them</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">5. Tips for Success</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>Update inventory at the beginning of each shift</li>
              <li>Review PAR levels monthly to optimize stock</li>
              <li>Use the notes feature to communicate with other staff</li>
              <li>Export prep lists for offline use when needed</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Tutorial;
