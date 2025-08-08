import { DockerCommandFunction } from "./index";

export const handleImagesCommand: DockerCommandFunction = (
  args,
  setContainers,
  setImages,
  containers,
  images
) => {
  let imageOutput =
    "REPOSITORY   TAG        IMAGE ID         CREATED        SIZE\n";
  images.forEach((image) => {
    imageOutput += `${image.repository.padEnd(12)} ${image.tag.padEnd(
      9
    )} ${image.id.substring(7, 19)}   ${image.created.padEnd(14)} ${
      image.size
    }\n`;
  });
  return imageOutput.trim();
};
