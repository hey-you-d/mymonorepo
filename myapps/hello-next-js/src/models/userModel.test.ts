import { UserModel } from "./UserModel";
import axios from "axios";

jest.mock("axios");

describe("User Model", () => {
    it("fetches user data", async () => {
        const resolvedOutput = {
            name: "Yudiman Kwanmas",
            email: "kwanmas.yudiman@outlook.com",
            avatars: "https://myavatar.com/yudimankwanmas",
            createdAt: "2025-03-24"
        };
        
        (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue({ data: resolvedOutput });

        const model = new UserModel(axios);
        const result = await model.fetchUser("1");

        expect(result).toEqual(resolvedOutput);
    });
});
