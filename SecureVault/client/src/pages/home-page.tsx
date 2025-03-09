import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { LogOut, Plus, Search, Settings, Shield } from "lucide-react";
import PasswordList from "@/components/password-list";
import PasswordForm from "@/components/password-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [search, setSearch] = useState("");
  const [isAddingPassword, setIsAddingPassword] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">SecureVault</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/generator">Password Generator</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search passwords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={isAddingPassword} onOpenChange={setIsAddingPassword}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <PasswordForm onSuccess={() => setIsAddingPassword(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <PasswordList searchQuery={search} />
      </main>
    </div>
  );
}
