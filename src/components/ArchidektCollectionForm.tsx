import { FC, useState } from "react";

type ArchidektCollectionFormProps = {
    collectionId: string,
    setCollectionId: (newId: string) => void
}

export const ArchidektCollectionForm: FC<ArchidektCollectionFormProps> = ({ collectionId, setCollectionId }) => {
    return (
        <div>
            Archidekt Collection ID: <input type="text" value={collectionId} onChange={(e) => setCollectionId(e.target.value)} />
        </div>
    )
}