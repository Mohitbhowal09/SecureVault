import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { generatePassword } from "@/lib/encryption";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, X } from "lucide-react";
import PasswordStrength from "@/components/ui/password-strength";
import { useLocation } from "wouter";

export default function PasswordGenerator() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [length, setLength] = useState([16]);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const generateNewPassword = () => {
    const newPassword = generatePassword(length[0], options);
    setPassword(newPassword);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(password);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Password Generator</CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation("/")}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-24"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={generateNewPassword}
                  className="h-8 w-8"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <PasswordStrength password={password} />
          </div>

          <div className="space-y-2">
            <Label>Password Length: {length[0]}</Label>
            <Slider
              value={length}
              onValueChange={setLength}
              min={8}
              max={32}
              step={1}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase">Uppercase Letters</Label>
              <Switch
                id="uppercase"
                checked={options.uppercase}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, uppercase: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="lowercase">Lowercase Letters</Label>
              <Switch
                id="lowercase"
                checked={options.lowercase}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, lowercase: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="numbers">Numbers</Label>
              <Switch
                id="numbers"
                checked={options.numbers}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, numbers: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="symbols">Special Characters</Label>
              <Switch
                id="symbols"
                checked={options.symbols}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, symbols: checked })
                }
              />
            </div>
          </div>

          <Button onClick={generateNewPassword} className="w-full">
            Generate Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}