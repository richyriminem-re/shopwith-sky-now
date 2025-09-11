import { NIGERIAN_STATES } from '@/data/countries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface CitySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const CitySelect = ({ value, onChange, error }: CitySelectProps) => {
  return (
    <FormItem>
      <FormLabel>State/City</FormLabel>
      <FormControl>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="neu-input">
            <SelectValue placeholder="Select your state" className="text-muted-foreground" />
          </SelectTrigger>
          <SelectContent className="neu-surface border z-50 bg-background max-h-60">
            {NIGERIAN_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
};