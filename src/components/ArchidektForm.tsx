import { FC } from "react";

type ArchidektFormProps = {
    username: string | undefined,
    setUsername: (newUsername: string) => void,
    password: string | undefined,
    setPassword: (newPassword: string) => void,
}

export const ArchidektForm: FC<ArchidektFormProps> = ({ username: username, setUsername: setUserName, password, setPassword }) => {
    return (
        <form>
            <div>
                <label>
                    Archidekt Username:
                </label>
                <input type="text" value={username} onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div>
                <label>
                    Archidekt Password:
                </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
        </form>
    )
}