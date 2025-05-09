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

interface QuickStartGuideProps {
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm";
}

const QuickStartGuide = ({
  variant = "secondary",
  size = "sm",
}: QuickStartGuideProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          Quick Start Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Start Guide</DialogTitle>
          <DialogDescription>
            Get started with Gerald's Prep List Generator in 3 easy steps.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span className="font-bold">1</span>
            </div>
            <div>
              <h3 className="font-medium mb-1">Update Your Inventory</h3>
              <p className="text-sm text-muted-foreground">
                Go to the "Inventory" tab and enter your current stock levels
                for each ingredient. Click "Save Inventory" when you're done.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span className="font-bold">2</span>
            </div>
            <div>
              <h3 className="font-medium mb-1">Check Your PAR Levels</h3>
              <p className="text-sm text-muted-foreground">
                Visit the "PAR Levels" tab to review and adjust your target
                stock levels if needed. These determine how much of each item
                you should keep on hand.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span className="font-bold">3</span>
            </div>
            <div>
              <h3 className="font-medium mb-1">View Your Prep List</h3>
              <p className="text-sm text-muted-foreground">
                Go to the "Prep Lists" tab to see what needs to be prepared,
                prioritized by urgency. Check off items as you complete them.
              </p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-medium">Pro Tip:</p>
            <p className="text-sm text-muted-foreground">
              The dashboard shows critical items that need immediate attention.
              Check it first for a quick overview of your kitchen's needs.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickStartGuide;
