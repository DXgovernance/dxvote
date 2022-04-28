import { Box, Text } from './Box';

export default function ErrorMessage({ error }) {
  return error ? (
    <Box p={4}>
      <Text>{error.message || error.toString()}</Text>
    </Box>
  ) : null;
}

