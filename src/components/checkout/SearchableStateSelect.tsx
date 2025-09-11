import * as React from "react";
import { Check, ChevronsUpDown, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NIGERIAN_STATES } from "@/data/countries";

interface SearchableStateSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function SearchableStateSelect({
  value,
  onChange,
  placeholder = "Select State...",
  error,
  disabled = false
}: SearchableStateSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Filter states based on search input (search both state name and city)
  const filteredStates = React.useMemo(() => {
    if (!searchValue) return NIGERIAN_STATES;
    
    const searchLower = searchValue.toLowerCase();
    return NIGERIAN_STATES.filter(state => {
      const [stateName, cityName] = state.split(', ');
      return (
        stateName.toLowerCase().includes(searchLower) ||
        cityName.toLowerCase().includes(searchLower)
      );
    });
  }, [searchValue]);

  const handleSelect = (state: string) => {
    onChange(state);
    setOpen(false);
    setSearchValue("");
  };

  React.useEffect(() => {
    if (!open) {
      setSearchValue("");
    }
  }, [open]);

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "neu-input w-full justify-between text-left font-normal h-10",
              !value && "text-muted-foreground",
              error && "border-destructive focus:border-destructive",
              disabled && "bg-muted/50 cursor-not-allowed pr-10 sm:pr-12"
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin size={16} className="text-muted-foreground flex-shrink-0" />
              <span className="truncate">
                {value ? value : placeholder}
              </span>
            </div>
            <ChevronsUpDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50", disabled && "mr-6")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-full p-0 bg-background border-border shadow-lg z-50" 
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search State Or City..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
            />
          </div>
          <ScrollArea className="h-[200px]">
            <div className="p-1">
              {filteredStates.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No State Found.
                </div>
              ) : (
                filteredStates.map((state) => {
                  const [stateName, cityName] = state.split(', ');
                  return (
                    <div
                      key={state}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                        "focus:bg-accent focus:text-accent-foreground"
                      )}
                      onClick={() => handleSelect(state)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Check
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            value === state ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium truncate">{stateName}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            Capital: {cityName}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}