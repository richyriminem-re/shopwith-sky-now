import { NEARBY_COUNTRIES } from '@/data/countries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const CountrySelect = ({ value, onChange, error }: CountrySelectProps) => {
  return (
    <FormItem>
      <FormLabel>Country</FormLabel>
      <FormControl>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="neu-input">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="neu-surface border z-50 bg-background">
            {NEARBY_COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.name}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
};