"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { US_STATES } from "@/lib/data/us-states";

interface StateSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function StateSelector({ value, onValueChange, placeholder = "Select state..." }: StateSelectorProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? US_STATES.find((state) => state.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search states..." />
          <CommandEmpty>No state found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {US_STATES.map((state) => (
              <CommandItem
                key={state.value}
                value={state.label}
                onSelect={(currentValue) => {
                  const selectedState = US_STATES.find(
                    s => s.label.toLowerCase() === currentValue.toLowerCase()
                  );
                  if (selectedState) {
                    onValueChange(selectedState.value);
                    setOpen(false);
                  }
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === state.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {state.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}