import {
  ChakraProvider,
  Box,
  Container,
  Heading,
  Flex,
  defaultSystem,
  DialogRoot,
  DialogTrigger,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogCloseTrigger,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Button,
} from "@chakra-ui/react";
import { useState, useEffect, lazy } from "react";

const LazyWheel = lazy(() =>
  import("../wheels/Wheel1").then((module) => ({ default: module.Wheel }))
);
const LazyNameEntries = lazy(() =>
  import("../NameEntries").then((module) => ({ default: module.NameEntries }))
);

export function Page1() {
  const defaultNames = ['1','2','3','4','5','6','7'];
  const [history, setHistory] = useState<string[]>(() => {
  const saved = 
  localStorage.getItem("wheel-history");
  return saved ? JSON.parse(saved) : [];
});
  const [headerText, setHeaderText] = useState<string>('Bốc thăm số thứ tự');
  const [names, setNames] = useState<string[]>([]);
  const [shuffleNames, setShuffleNames] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);


  const removeWinnerFromWheel = () => {
    if (winner) {
      const updatedNames = names.filter((name) => name !== winner);
      setNames(updatedNames);

      localStorage.setItem("wheel-names-1", JSON.stringify(updatedNames));

      // Update the textarea content
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.value = updatedNames.join("\n");
      }
      setWinner(null);
      setIsDialogOpen(false);
    }
  };

  const announceWinner = (name: string) => {
    setWinner(name);
    setIsDialogOpen(true);

    const newHistory = [...history, name];
    setHistory(newHistory);
    localStorage.setItem("wheel-history", JSON.stringify(newHistory));
    
    // Create fireworks container
    const pyroContainer = document.createElement("div");
    pyroContainer.className = "pyro";

    // Create before and after elements
    const beforeElement = document.createElement("div");
    beforeElement.className = "before";
    const afterElement = document.createElement("div");
    afterElement.className = "after";

    pyroContainer.appendChild(beforeElement);
    pyroContainer.appendChild(afterElement);

    // Append to the DOM
    document.body.appendChild(pyroContainer);

    // Remove after animation
    setTimeout(() => {
      if (document.body.contains(pyroContainer)) {
        document.body.removeChild(pyroContainer);
      }
    }, 4000); // Remove fireworks after 5 seconds
  };
  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeaderText = e.target.value;
    updateHeaderText(newHeaderText);
  };

  const pickRandomHeader = () => {
    const header = "Chọn lượt quay";
    updateHeaderText(header);
  };

  const updateHeaderText = (newHeaderText: string) => {
    setHeaderText(newHeaderText);
    document.title = newHeaderText;
  };

  return (
    <>
      <Box as="main" minH="100vh">
        <Container maxW="container.xl" py={6}>
          <Heading
            mt={10}
            mb={10}
            textAlign="center"
            fontSize="3xl"
            fontWeight="bold"
            bgGradient="linear(to-r, blue.600, purple.500, pink.500)"
            bgClip="text"
            color="black"
          >
            {headerText}
          </Heading>

          <Flex width="full" direction={{ base: "column", lg: "row" }} gap={8} align="start">
  {/* Tăng width lên 80% hoặc để auto để nó nở ra theo giới hạn 1200px */}
  <Box width={{ base: "100%", lg: "75%" }} mb={{ base: 6, lg: 0 }}>
    <LazyWheel
      names={names}
      setNames={setNames}
      onSelectWinner={(name: string) => announceWinner(name)}
    />
  </Box>
  
  {/* Giảm width của cột danh sách xuống */}
  <Box width={{ base: "100%", lg: "25%" }}>
    <LazyNameEntries
      names={names}
      setNames={setNames}
      headerText={headerText}
      defaultNames={defaultNames} 
      wheelName={"1"} 
      setHeaderText={handleHeaderChange}                         
    />
  </Box>
</Flex>
        </Container>
      </Box>

      <DialogRoot open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger />
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent>
            <DialogCloseTrigger />
            <DialogHeader>
              <DialogTitle>Chúc mừng</DialogTitle>
            </DialogHeader>
            <DialogBody>STT của bạn là: {winner}! 🎉</DialogBody>
            <DialogFooter>
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="ghost"
                background="transparent"
              >
                Close
              </Button>
              <Button
                bg="#EAEAEA"
                color="#333333"
                borderRadius="4px"
                _hover={{ bg: "#CCCCCC" }}
                onClick={removeWinnerFromWheel}
                ml={3}
              >
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </>
  );
}