import React from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Separator } from "@/components/ui/separator";

interface SettingsProps {
  variant?: "default" | "outline";
  size?: "default" | "sm";
}

const Settings = ({ variant = "outline", size = "sm" }: SettingsProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <SettingsIcon className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Adjust your application preferences here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Notifications</span>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Language</span>
            <Button variant="outline" size="sm">
              English
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
