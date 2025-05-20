"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function Home() {
  const [rulesOpen, setRulesOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800 text-white p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-8">Jeu de Mots</h1>
        <p className="text-xl mb-12 max-w-md mx-auto">
          Un jeu de mots pour deux joueurs où chacun ajoute une lettre à tour de rôle pour former des mots.
        </p>

        <div className="space-y-4">
          <Link href="/jeu" className="block">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-6">
              Commencer le jeu
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => setRulesOpen(true)}
            className="border-blue-300 text-blue-600 hover:bg-blue-700 hover:text-white"
          >
            Règles du jeu
          </Button>
        </div>
      </div>

      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Règles du jeu</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Jeu pour 2 joueurs</li>
              <li>Le joueur 1 commence le premier jeu, puis les joueurs alternent</li>
              <li>Chaque joueur a 60 secondes par tour</li>
              <li>À chaque tour, ajoutez une lettre</li>
              <li>Si vous formez un mot français valide (4 lettres minimum), vous gagnez un point</li>
              <li>Si vous abandonnez, l&apos;autre joueur a 60 secondes pour compléter un mot</li>
              <li>Si le temps est écoulé, vous perdez le tour</li>
            </ul>
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setRulesOpen(false)}>Compris</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
