import { AdminUseCase } from "./src/usecases/admin.usecase.js";
import { TokenRepositoryImpl } from "./src/infrastructure/repositories/token.repository.impl.js";

async function main() {
  const repo = new TokenRepositoryImpl();
  const usecase = new AdminUseCase(repo);
  
  try {
    const tokens = await usecase.generateTokens(["test1@test.com", "test2@test.com"]);
    console.log("Success:", tokens);
  } catch (error) {
    console.error("Error generating tokens:", error);
  }
}
main();
