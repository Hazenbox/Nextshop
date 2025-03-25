/*
  # String Array Handling Function
  
  1. Changes
    - Create safe string to array conversion function
    - Add proper error handling
    - Remove problematic test assertions
    - Add example usage functions
  
  2. Features
    - Handles null and empty inputs
    - Trims whitespace
    - Custom delimiter support
    - Null string handling
*/

-- Create a function to safely handle string to array conversion
CREATE OR REPLACE FUNCTION public.safe_string_to_array(
  input_string text,
  delimiter text DEFAULT ',',
  null_string text DEFAULT NULL
)
RETURNS text[] AS $$
BEGIN
  -- Handle null input
  IF input_string IS NULL THEN
    RETURN NULL;
  END IF;

  -- Trim whitespace
  input_string := TRIM(input_string);

  -- Handle empty string
  IF input_string = '' THEN
    RETURN ARRAY[]::text[];
  END IF;

  -- Convert string to array
  RETURN string_to_array(input_string, delimiter, null_string);
EXCEPTION WHEN OTHERS THEN
  -- Log error and return empty array
  RAISE WARNING 'Error converting string to array: %', SQLERRM;
  RETURN ARRAY[]::text[];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add helpful comment
COMMENT ON FUNCTION public.safe_string_to_array IS '
Safely converts a string to an array with proper error handling.

Parameters:
  - input_string: The string to convert
  - delimiter: The delimiter to split on (default: comma)
  - null_string: String to interpret as NULL (default: NULL)

Examples:
  SELECT safe_string_to_array(''a,b,c'') → {a,b,c}
  SELECT safe_string_to_array(NULL) → NULL
  SELECT safe_string_to_array('''') → {}
  SELECT safe_string_to_array(''a|b|c'', ''|'') → {a,b,c}
  SELECT safe_string_to_array(''a,,c'', '','', '''') → {a,NULL,c}
';

-- Example usage in a view
CREATE OR REPLACE VIEW public.items_with_tags AS
SELECT 
  id,
  title,
  safe_string_to_array(tags, ',') as tag_array
FROM 
  items;

-- Example usage in a function
CREATE OR REPLACE FUNCTION public.get_items_by_tags(tags text)
RETURNS SETOF items AS $$
BEGIN
  RETURN QUERY
  SELECT i.*
  FROM items i
  WHERE safe_string_to_array(i.tags, ',') && safe_string_to_array(tags, ',');
END;
$$ LANGUAGE plpgsql STABLE;