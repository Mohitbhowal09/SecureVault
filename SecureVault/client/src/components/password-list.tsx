import { useQuery, useMutation } from "@tanstack/react-query";
import { Password } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { decryptPassword } from "@/lib/encryption";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PasswordList({ searchQuery }: { searchQuery: string }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: passwords, isLoading } = useQuery<Password[]>({
    queryKey: ["/api/passwords"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/passwords/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      toast({
        title: "Success",
        description: "Password deleted successfully",
      });
    },
  });

  const copyPassword = async (encrypted: string) => {
    if (!user) return;
    const decrypted = decryptPassword(encrypted, user.password);
    await navigator.clipboard.writeText(decrypted);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard",
    });
  };

  const filteredPasswords = passwords?.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!filteredPasswords?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No passwords found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>URL</TableHead>
          <TableHead className="w-28">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredPasswords.map((password) => (
          <TableRow key={password.id}>
            <TableCell className="font-medium">{password.title}</TableCell>
            <TableCell>{password.username}</TableCell>
            <TableCell>{password.category}</TableCell>
            <TableCell>
              {password.url && (
                <a
                  href={password.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {password.url}
                </a>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyPassword(password.encryptedPassword)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(password.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
