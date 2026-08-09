import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type ArchidektFormProps = {
    username: string | undefined,
    setUsername: (newUsername: string) => void,
    password: string | undefined,
    setPassword: (newPassword: string) => void,
}

export const ArchidektForm: FC<ArchidektFormProps> = ({ username: username, setUsername: setUserName, password, setPassword }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Archidekt credentials</CardTitle>
                <CardDescription>Used to import the selected cards directly into your Archidekt collection.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="archidekt-username">Username</Label>
                        <Input
                            id="archidekt-username"
                            type="text"
                            autoComplete="username"
                            value={username ?? ""}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="archidekt-password">Password</Label>
                        <Input
                            id="archidekt-password"
                            type="password"
                            autoComplete="current-password"
                            value={password ?? ""}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
