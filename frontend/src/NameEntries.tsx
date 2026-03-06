import { useState, useEffect, useRef } from "react";
import { Box, Button, Flex } from "@chakra-ui/react";
import { ArrowUp, ArrowDown, Shuffle, Trash, RefreshCcw } from "lucide-react";

const SortAZIcon = (props: any) => <Box as={ArrowUp} {...props} />;
const SortZAIcon = (props: any) => <Box as={ArrowDown} {...props} />;
const ShuffleIcon = (props: any) => <Box as={Shuffle} {...props} />;
const DeleteIcon = (props: any) => <Box as={Trash} {...props} />;
const RandomIcon = (props: any) => <Box as={RefreshCcw} {...props} />;

interface NameEntriesProps {
  names: string[];
  setNames: (names: string[]) => void;
  headerText: string;
  setHeaderText: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultNames: string[];
  wheelName: string;
}

export const EditableHeader: React.FC<{
  headerText: string;
  setHeaderText: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ headerText, setHeaderText }) => {
  return (
    <Box textAlign="center" mb={6}>
      <Flex align="center" justify="start" gap={2}>
        <input
          type="text"
          value={headerText}
          onChange={setHeaderText}
          style={{
            padding: "8px",
            backgroundColor: "#F8F7F3",
            border: "1px solid #CCCCCC",
            borderRadius: "4px",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            width: "80%",
          }}
          placeholder="Edit header text"
        />
      </Flex>
    </Box>
  );
};

export const NameEntries: React.FC<NameEntriesProps> = ({
  names,
  setNames,
  headerText,
  setHeaderText,
  defaultNames,
  wheelName

}) => {
  

  const [isAscending, setIsAscending] = useState<boolean>(true);

  useEffect(() => {
    const storedNames = localStorage.getItem("wheel-"+wheelName);
    if (storedNames) {
      try {
        const parsedNames = JSON.parse(storedNames);
        if (Array.isArray(parsedNames) && parsedNames.length > 0) {
          setNames(parsedNames);

          // Populate the textarea with stored names
          const textarea = document.querySelector("textarea");
          if (textarea) {
            textarea.value = parsedNames.join("\n");
          }
        } else {
          updateNames(defaultNames); // Initialize with default names if stored data is invalid
        }
      } catch (error) {
        console.error("Error parsing names from localStorage:", error);
        setNames(defaultNames); // Fallback to default names on error
      }
    } else {
      updateNames(defaultNames); // Initialize with default names if no data is stored
    }
  }, []);

  const updateNames = (updatedNames: string[]) => {
    setNames(updatedNames);
    localStorage.setItem("wheel-names-"+wheelName, JSON.stringify(updatedNames));

    // Update the textarea content
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.value = updatedNames.join("\n");
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const updatedNames = text
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name);
    setNames(updatedNames);
    localStorage.setItem("wheel-names-"+wheelName, JSON.stringify(updatedNames));
  };

  return (
    <>
      <Box
        width="full"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="xl"
        bg="white"
        _dark={{ bg: "gray.800" }}
        borderWidth="1px"
        borderColor="gray.200"
        height="full"
        p={6}
      >
        <EditableHeader
          headerText={headerText}
          setHeaderText={setHeaderText}
        />

        <Box>
          <Flex align="center" justify="start" gap={2}>
          </Flex>
        </Box>

        <Box mt={6}>
          <textarea
            placeholder="Enter names, one per line"
            style={{
              width: "100%",
              height: "auto",
              minHeight: "500px",
              resize: "none",
              backgroundColor: "#F8F7F3",
              border: "1px solid #CCCCCC",
              borderRadius: "4px",
              padding: "10px",
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
            }}
            onChange={handleTextareaChange}
          />
        </Box>
      </Box>
    </>
  );
};
