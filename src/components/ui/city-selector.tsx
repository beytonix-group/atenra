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
import { US_CITIES_BY_STATE } from "@/lib/data/us-states";

interface CitySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  state?: string;
}

export function CitySelector({ value, onValueChange, placeholder = "Select city...", state }: CitySelectorProps) {
  const [open, setOpen] = React.useState(false);
  
  // Get cities for the selected state, or all cities if no state selected
  const cities = React.useMemo(() => {
    if (state && US_CITIES_BY_STATE[state]) {
      return US_CITIES_BY_STATE[state];
    }
    // Return all cities from all states if no state is selected
    return Object.values(US_CITIES_BY_STATE).flat().filter((city, index, self) => 
      self.indexOf(city) === index // Remove duplicates
    ).sort();
  }, [state]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search cities..." />
          <CommandEmpty>No city found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {cities.map((city) => (
              <CommandItem
                key={city}
                value={city}
                onSelect={(currentValue) => {
                  onValueChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === city ? "opacity-100" : "opacity-0"
                  )}
                />
                {city}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}