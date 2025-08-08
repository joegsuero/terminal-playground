import { DockerCommandFunction } from "./index";

export const handleBuildCommand: DockerCommandFunction = (args) => {
  const tagFlag = args.indexOf("-t");
  const tagName = tagFlag !== -1 ? args[tagFlag + 1] : "unnamed";

  return `Sending build context to Docker daemon  2.048kB
Step 1/5 : FROM node:16-alpine
 ---> sha256:f77a1aef2cec
Step 2/5 : WORKDIR /app
 ---> Using cache
 ---> sha256:b2c3d4e5f6a7
Step 3/5 : COPY package*.json ./
 ---> Using cache
 ---> sha256:c3d4e5f6a7b8
Step 4/5 : RUN npm install
 ---> Using cache
 ---> sha256:d4e5f6a7b8c9
Step 5/5 : COPY . .
 ---> sha256:e5f6a7b8c9d0
Successfully built e5f6a7b8c9d0
Successfully tagged ${tagName}:latest`;
};
