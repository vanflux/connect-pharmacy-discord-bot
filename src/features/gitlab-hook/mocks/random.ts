import { mockMessageApproveMr } from "./mock-message-approve-mr";
import { mockMessageMergeMr } from "./mock-message-merge-mr";
import { mockMessageOpenMr } from "./mock-message-open-mr";
import { mockMessagePushBranch } from "./mock-message-push-branch";

const mocks = [mockMessageApproveMr, mockMessageMergeMr, mockMessageOpenMr, mockMessagePushBranch];

export const getRandomMockMessage = () => {
  return mocks[Math.floor(Math.random() * mocks.length)];
};
