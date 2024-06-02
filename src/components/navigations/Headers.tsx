import {
  OrganizationSwitcher,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  UserProfile,
} from "@clerk/nextjs";
import { Button } from "../ui/button";

export default function Headers() {
  return (
    <header className=" border-b py-4  bg-gray-50">
      <div className="flex justify-between items-center container mx-auto">
        <h2>FileDrive</h2>
        <div>
          <OrganizationSwitcher />
          <UserButton />
          <SignedOut>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
