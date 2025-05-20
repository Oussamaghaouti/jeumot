"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { dictionnaireFrancais } from "@/lib/dictionnaire"
import { dictionnaireAnglais } from "@/lib/dictionnaire-anglais"
import { dictionnaireArabe } from "@/lib/dictionnaire-arabe"
import { Menu, Infinity } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function JeuPage() {
  const router = useRouter()
  const [scoreJoueur1, setScoreJoueur1] = useState(0)
  const [scoreJoueur2, setScoreJoueur2] = useState(0)
  const [joueurActuel, setJoueurActuel] = useState(1)
  const [motActuel, setMotActuel] = useState("")
  const [tempsParTour, setTempsParTour] = useState(60)
  const [tempsInfini, setTempsInfini] = useState(false)
  const [tempsRestant, setTempsRestant] = useState(tempsParTour)
  const [jeuEnCours, setJeuEnCours] = useState(false)
  const [partieTerminee, setPartieTerminee] = useState(true)
  const [premierJeu, setPremierJeu] = useState(true)
  const [verification, setVerification] = useState(false)
  const [modeAbandon, setModeAbandon] = useState(false)
  const [enPause, setEnPause] = useState(false)
  const [langue, setLangue] = useState<"francais" | "anglais" | "arabe">("francais")
  const [nomJoueur1, setNomJoueur1] = useState("Joueur 1")
  const [nomJoueur2, setNomJoueur2] = useState("Joueur 2")
  const [configurationOuverte, setConfigurationOuverte] = useState(true)
  const [dialogInfo, setDialogInfo] = useState<{
    ouvert: boolean
    titre: string
    message: string
    action?: () => void
  }>({
    ouvert: false,
    titre: "",
    message: "",
  })

  // Fonction pour vérifier si un mot existe dans le dictionnaire
  const verifierMot = useCallback(
    async (mot: string) => {
      if (mot.length < 4) return false

      setVerification(true)

      // Simuler un délai d'API
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Vérifier dans le dictionnaire approprié
      let motExiste = false

      switch (langue) {
        case "francais":
          motExiste = dictionnaireFrancais.includes(mot.toLowerCase())
          break
        case "anglais":
          motExiste = dictionnaireAnglais.includes(mot.toLowerCase())
          break
        case "arabe":
          motExiste = dictionnaireArabe.includes(mot)
          break
      }

      setVerification(false)
      return motExiste
    },
    [langue],
  )

  // Fonction pour vérifier automatiquement si le mot actuel est valide
  const verifierMotActuel = async (mot: string) => {
    if (mot.length >= 4) {
      const motValide = await verifierMot(mot)
      if (motValide) {
        // Si le mot est valide, le joueur actuel gagne un point
        if (joueurActuel === 1) {
          setScoreJoueur1((prev) => prev + 1)
        } else {
          setScoreJoueur2((prev) => prev + 1)
        }

        afficherDialog(
          "Mot valide!",
          `${joueurActuel === 1 ? nomJoueur1 : nomJoueur2} gagne un point avec le mot "${mot}".`,
          () => {
            setMotActuel("")
            setModeAbandon(false)
            setJeuEnCours(true)
          },
        )
      }
    }
  }

  // Gestion du timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (jeuEnCours && !enPause && !tempsInfini) {
      timer = setInterval(() => {
        setTempsRestant((prev) => {
          if (prev <= 1) {
            clearInterval(timer as NodeJS.Timeout)
            finDuTour(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [jeuEnCours, enPause, joueurActuel, tempsInfini])

  // Fonction pour ajouter une lettre
  const ajouterLettre = (lettre: string) => {
    if (jeuEnCours && !verification && !enPause) {
      setMotActuel((prev) => prev + lettre)

      // Après avoir ajouté une lettre, vérifier si c'est un mot valide
      verifierMotActuel(motActuel + lettre)

      // Si ce n'est pas un abandon, on passe au joueur suivant après avoir ajouté une lettre
      if (!modeAbandon) {
        setJoueurActuel((prev) => (prev === 1 ? 2 : 1))
        setTempsRestant(tempsParTour)
      }
    }
  }

  // Fonction pour mettre le jeu en pause ou reprendre
  const togglePause = () => {
    setEnPause((prev) => !prev)
  }

  // Fonction pour afficher un dialogue
  const afficherDialog = (titre: string, message: string, action?: () => void) => {
    setDialogInfo({
      ouvert: true,
      titre,
      message,
      action,
    })
  }

  // Fonction pour fermer le dialogue
  const fermerDialog = () => {
    setDialogInfo((prev) => ({ ...prev, ouvert: false }))
    if (dialogInfo.action) dialogInfo.action()
  }

  // Fonction pour gérer la fin d'un tour
  const finDuTour = async (tempsEcoule = false, abandon = false) => {
    setJeuEnCours(false)

    if (tempsEcoule) {
      // Si le temps est écoulé, l'autre joueur gagne un point
      if (joueurActuel === 1) {
        setScoreJoueur2((prev) => prev + 1)
      } else {
        setScoreJoueur1((prev) => prev + 1)
      }

      afficherDialog("Temps écoulé!", `${joueurActuel === 1 ? nomJoueur2 : nomJoueur1} gagne un point.`, () => {
        setMotActuel("")
        setJoueurActuel(joueurActuel === 1 ? 2 : 1)
        setTempsRestant(tempsParTour)
        setJeuEnCours(true)
        setModeAbandon(false)
      })
    } else if (abandon) {
      // Si le joueur abandonne, on donne la possibilité à l'autre joueur de compléter un mot
      setModeAbandon(true)
      setJoueurActuel(joueurActuel === 1 ? 2 : 1)
      setTempsRestant(tempsParTour)

      afficherDialog(
        `${joueurActuel === 1 ? nomJoueur2 : nomJoueur1}`,
        `${joueurActuel === 1 ? nomJoueur1 : nomJoueur2} a abandonné. Vous avez ${
          tempsInfini ? "un temps illimité" : `${tempsParTour} secondes`
        } pour compléter un mot valide.`,
        () => {
          setJeuEnCours(true)
        },
      )
    } else if (modeAbandon) {
      // Vérification du mot après un abandon
      const motValide = await verifierMot(motActuel)

      if (motValide) {
        // Si le mot est valide, le joueur actuel gagne un point
        if (joueurActuel === 1) {
          setScoreJoueur1((prev) => prev + 1)
        } else {
          setScoreJoueur2((prev) => prev + 1)
        }

        afficherDialog(
          "Mot valide!",
          `${joueurActuel === 1 ? nomJoueur1 : nomJoueur2} gagne un point avec le mot "${motActuel}".`,
          passerAuTourSuivant,
        )
      } else {
        // Si le mot n'est pas valide, l'autre joueur gagne un point
        if (joueurActuel === 1) {
          setScoreJoueur2((prev) => prev + 1)
        } else {
          setScoreJoueur1((prev) => prev + 1)
        }

        afficherDialog(
          "Mot invalide",
          `Le mot "${motActuel}" n'est pas valide. ${joueurActuel === 1 ? nomJoueur2 : nomJoueur1} gagne un point.`,
          passerAuTourSuivant,
        )
      }
    }
  }

  // Fonction pour passer au tour suivant
  const passerAuTourSuivant = () => {
    setMotActuel("")
    setJoueurActuel((prev) => (prev === 1 ? 2 : 1))
    setTempsRestant(tempsParTour)
    setJeuEnCours(true)
    setModeAbandon(false)
  }

  // Fonction pour démarrer un nouveau jeu
  const nouveauJeu = () => {
    setMotActuel("")
    setTempsRestant(tempsParTour)
    setJeuEnCours(true)
    setModeAbandon(false)
    setEnPause(false)
    setScoreJoueur1(0)
    setScoreJoueur2(0)
    setPartieTerminee(false)

    // Alterner le joueur qui commence pour le prochain jeu
    if (!premierJeu) {
      setJoueurActuel((prev) => (prev === 1 ? 2 : 1))
    }
    setPremierJeu(false)
  }

  // Fonction pour terminer la partie et permettre de revenir à la configuration
  const terminerPartie = () => {
    setJeuEnCours(false)
    setPartieTerminee(true)
    setEnPause(false)

    // Déterminer le gagnant
    let message = "La partie est terminée."
    if (scoreJoueur1 > scoreJoueur2) {
      message = `${nomJoueur1} gagne la partie avec ${scoreJoueur1} points contre ${scoreJoueur2} points!`
    } else if (scoreJoueur2 > scoreJoueur1) {
      message = `${nomJoueur2} gagne la partie avec ${scoreJoueur2} points contre ${scoreJoueur1} points!`
    } else {
      message = `Match nul! ${nomJoueur1} et ${nomJoueur2} ont tous les deux ${scoreJoueur1} points.`
    }

    afficherDialog("Partie terminée", message, () => {
      setConfigurationOuverte(true)
    })
  }

  // Fonction pour commencer le jeu après la configuration
  const commencerJeu = () => {
    // Valider les noms des joueurs
    if (!nomJoueur1.trim()) setNomJoueur1("Joueur 1")
    if (!nomJoueur2.trim()) setNomJoueur2("Joueur 2")

    setConfigurationOuverte(false)
    setJeuEnCours(true)
    setPartieTerminee(false)
    setTempsRestant(tempsParTour)
    setScoreJoueur1(0)
    setScoreJoueur2(0)
  }

  // Fonction pour gérer le changement de temps
  const handleTempsChange = (value: string) => {
    if (value === "infini") {
      setTempsInfini(true)
      setTempsParTour(0)
    } else {
      setTempsInfini(false)
      setTempsParTour(Number.parseInt(value))
    }
  }

  // Générer les touches du clavier
  const genererClavier = () => {
    const rangees = ["AZERTYUIOP", "QSDFGHJKLM", "WXCVBN"]

    // Pour l'arabe, on utilise un clavier différent
    const rangeesArabe = ["ضصثقفغعهخحج", "شسيبلاتنمكط", "ئءؤرلاىةوزظ", "ذدجإآأـ،."]

    const rangeesActuelles = langue === "arabe" ? rangeesArabe : rangees

    return (
      <div className="bg-gray-100 p-2 md:p-4 rounded-lg">
        {rangeesActuelles.map((rangee, index) => (
          <div key={index} className="flex justify-center mb-1 md:mb-2">
            {rangee.split("").map((lettre) => (
              <button
                key={lettre}
                onClick={() => ajouterLettre(lettre)}
                disabled={!jeuEnCours || verification || enPause}
                className="w-7 h-9 md:w-10 md:h-12 m-0.5 md:m-1 bg-white rounded shadow-sm font-bold text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {lettre}
              </button>
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Écran de configuration
  const renderConfiguration = () => {
    return (
      <Card className="w-full max-w-md p-4 md:p-6 shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">Configuration du jeu</h2>

        <div className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nomJoueur1">Nom du Joueur 1</Label>
            <Input
              id="nomJoueur1"
              value={nomJoueur1}
              onChange={(e) => setNomJoueur1(e.target.value)}
              placeholder="Joueur 1"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomJoueur2">Nom du Joueur 2</Label>
            <Input
              id="nomJoueur2"
              value={nomJoueur2}
              onChange={(e) => setNomJoueur2(e.target.value)}
              placeholder="Joueur 2"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Temps par tour</Label>
            <RadioGroup
              value={tempsInfini ? "infini" : tempsParTour.toString()}
              onValueChange={handleTempsChange}
              className="flex flex-wrap gap-2 md:gap-4"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="30" id="temps-30" />
                <Label htmlFor="temps-30" className="cursor-pointer">
                  30s
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="45" id="temps-45" />
                <Label htmlFor="temps-45" className="cursor-pointer">
                  45s
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="60" id="temps-60" />
                <Label htmlFor="temps-60" className="cursor-pointer">
                  60s
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="90" id="temps-90" />
                <Label htmlFor="temps-90" className="cursor-pointer">
                  90s
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="120" id="temps-120" />
                <Label htmlFor="temps-120" className="cursor-pointer">
                  120s
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="infini" id="temps-infini" />
                <Label htmlFor="temps-infini" className="cursor-pointer flex items-center">
                  <Infinity className="h-4 w-4 mr-1" /> Infini
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Langue</Label>
            <div className="flex bg-blue-50 rounded-lg p-1">
              <button
                onClick={() => setLangue("francais")}
                className={`flex-1 px-3 py-2 rounded-md text-sm ${
                  langue === "francais" ? "bg-blue-600 text-white" : "text-blue-600"
                }`}
              >
                Français
              </button>
              <button
                onClick={() => setLangue("anglais")}
                className={`flex-1 px-3 py-2 rounded-md text-sm ${
                  langue === "anglais" ? "bg-blue-600 text-white" : "text-blue-600"
                }`}
              >
                Anglais
              </button>
              <button
                onClick={() => setLangue("arabe")}
                className={`flex-1 px-3 py-2 rounded-md text-sm ${
                  langue === "arabe" ? "bg-blue-600 text-white" : "text-blue-600"
                }`}
              >
                Arabe
              </button>
            </div>
          </div>

          <Button onClick={commencerJeu} className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
            Commencer le jeu
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* En-tête avec scores et timer */}
      <header className="bg-blue-700 text-white p-2 md:p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="border-blue-300 text-blue-600 hover:bg-blue-600 hover:text-white text-xs md:text-sm p-1 md:p-2"
            >
              Retour
            </Button>
          </div>

          <h1 className="text-lg md:text-2xl font-bold">Jeu de Mots</h1>

          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Menu déroulant pour mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon" className="border-blue-300 text-blue-600">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setLangue("francais")}
                  disabled={motActuel.length > 0}
                  className={motActuel.length > 0 ? "opacity-50 cursor-not-allowed" : ""}
                >
                  Français {langue === "francais" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLangue("anglais")}
                  disabled={motActuel.length > 0}
                  className={motActuel.length > 0 ? "opacity-50 cursor-not-allowed" : ""}
                >
                  Anglais {langue === "anglais" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLangue("arabe")}
                  disabled={motActuel.length > 0}
                  className={motActuel.length > 0 ? "opacity-50 cursor-not-allowed" : ""}
                >
                  Arabe {langue === "arabe" && "✓"}
                </DropdownMenuItem>
                {motActuel.length > 0 && (
                  <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed text-xs italic">
                    Langue verrouillée pendant le jeu
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {!configurationOuverte && (
              <Button
                variant="outline"
                onClick={nouveauJeu}
                className="md:hidden border-blue-300 text-blue-600 hover:bg-blue-600 hover:text-white text-xs p-1"
              >
                Nouveau
              </Button>
            )}

            {/* Options pour desktop */}
            <div className="hidden md:flex bg-blue-800 rounded-lg p-1 relative">
              <button
                onClick={() => setLangue("francais")}
                disabled={motActuel.length > 0}
                className={`px-3 py-1 rounded-md text-sm ${
                  langue === "francais" ? "bg-blue-600 text-white" : "text-blue-300"
                } ${motActuel.length > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Français
              </button>
              <button
                onClick={() => setLangue("anglais")}
                disabled={motActuel.length > 0}
                className={`px-3 py-1 rounded-md text-sm ${
                  langue === "anglais" ? "bg-blue-600 text-white" : "text-blue-300"
                } ${motActuel.length > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Anglais
              </button>
              <button
                onClick={() => setLangue("arabe")}
                disabled={motActuel.length > 0}
                className={`px-3 py-1 rounded-md text-sm ${
                  langue === "arabe" ? "bg-blue-600 text-white" : "text-blue-300"
                } ${motActuel.length > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Arabe
              </button>
              {motActuel.length > 0 && (
                <div className="hidden md:block absolute -bottom-5 right-0 text-xs text-blue-600 bg-blue-50 px-1 rounded">
                  Langue verrouillée pendant le jeu
                </div>
              )}
            </div>

            {configurationOuverte ? (
              <Button
                variant="outline"
                onClick={commencerJeu}
                className="hidden md:inline-flex border-blue-300 text-blue-600 hover:bg-blue-600 hover:text-white text-xs md:text-sm p-1 md:p-2"
              >
                Commencer le jeu
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={nouveauJeu}
                className="hidden md:inline-flex border-blue-300 text-blue-600 hover:bg-blue-600 hover:text-white text-xs md:text-sm p-1 md:p-2"
              >
                Nouveau jeu
              </Button>
            )}
          </div>
        </div>
      </header>

      {!configurationOuverte && (
        <>
          {/* Scores et informations */}
          <div className="bg-blue-100 p-2 md:p-4">
            <div className="container mx-auto flex justify-around items-center">
              <div className={`text-center p-1 md:p-2 rounded-lg ${joueurActuel === 1 ? "bg-blue-200 shadow-sm" : ""}`}>
                <div className="font-bold text-sm md:text-lg">{nomJoueur1}</div>
                <div className="text-sm md:text-base">Score: {scoreJoueur1}</div>
              </div>

              <div className="text-center">
                <div className="font-bold text-sm md:text-lg">Temps</div>
                <div
                  className={`text-base md:text-xl ${tempsRestant <= 10 && !tempsInfini ? "text-red-600 font-bold" : ""}`}
                >
                  {tempsInfini ? "∞" : `${tempsRestant}s`}
                </div>
              </div>

              <div className={`text-center p-1 md:p-2 rounded-lg ${joueurActuel === 2 ? "bg-blue-200 shadow-sm" : ""}`}>
                <div className="font-bold text-sm md:text-lg">{nomJoueur2}</div>
                <div className="text-sm md:text-base">Score: {scoreJoueur2}</div>
              </div>
            </div>
          </div>

          {/* Boutons de contrôle */}
          <div className="container mx-auto px-2 md:px-4 py-1 md:py-2 flex justify-between">
            <Button
              variant="outline"
              onClick={terminerPartie}
              className="text-xs md:text-sm border-blue-300 text-blue-600"
            >
              Terminer la partie
            </Button>

            <Button
              variant={enPause ? "default" : "outline"}
              onClick={togglePause}
              className={`text-xs md:text-sm ${enPause ? "bg-green-600 hover:bg-green-700" : "border-blue-300 text-blue-600"}`}
            >
              {enPause ? "Reprendre" : "Pause"}
            </Button>
          </div>
        </>
      )}

      {/* Zone principale de jeu */}
      <main className="flex-grow container mx-auto p-2 md:p-4 flex flex-col items-center justify-center relative">
        {/* Écran de configuration */}
        {configurationOuverte ? (
          renderConfiguration()
        ) : (
          <>
            {/* Overlay de pause */}
            {enPause && (
              <div className="absolute inset-0 bg-black bg-opacity-70 z-10 flex items-center justify-center rounded-lg">
                <div className="text-center text-white p-4">
                  <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">Jeu en pause</h2>
                  <p className="mb-4 md:mb-6">Cliquez sur "Reprendre" pour continuer</p>
                  <Button onClick={togglePause} className="bg-green-600 hover:bg-green-700 text-sm md:text-base">
                    Reprendre
                  </Button>
                </div>
              </div>
            )}

            <Card className="w-full max-w-2xl p-3 md:p-6 shadow-lg">
              <div className="text-center mb-3 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Mot actuel</h2>
                <div className="border-2 border-blue-300 rounded-lg p-2 md:p-4 min-h-12 md:min-h-16 flex items-center justify-center">
                  <span className="text-xl md:text-3xl font-bold tracking-wider">{motActuel || "..."}</span>
                </div>
              </div>

              <div className="text-center mb-3 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-blue-700">
                  Tour de {joueurActuel === 1 ? nomJoueur1 : nomJoueur2}
                </h3>
                {modeAbandon ? (
                  <p className="text-xs md:text-sm mt-1 md:mt-2 text-orange-600">
                    Mode abandon: Vous pouvez ajouter plusieurs lettres pour compléter un mot
                  </p>
                ) : (
                  <p className="text-xs md:text-sm mt-1 md:mt-2">Ajoutez une seule lettre</p>
                )}
                {verification && (
                  <div className="flex justify-center mt-1 md:mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 md:h-6 md:w-6 border-b-2 border-blue-700"></div>
                  </div>
                )}
              </div>

              <div className="flex justify-center space-x-2 md:space-x-4 mb-4 md:mb-8">
                <Button
                  variant="destructive"
                  onClick={() => finDuTour(false, true)}
                  disabled={!jeuEnCours || verification || enPause}
                  className="text-xs md:text-sm py-1 px-2 md:py-2 md:px-4"
                >
                  J&apos;abandonne
                </Button>
                <Button
                  variant="default"
                  onClick={() => finDuTour()}
                  disabled={!jeuEnCours || verification || motActuel.length < 4 || enPause}
                  className={`text-xs md:text-sm py-1 px-2 md:py-2 md:px-4 ${modeAbandon ? "" : "hidden"}`}
                >
                  Valider le mot
                </Button>
              </div>

              {genererClavier()}
            </Card>
          </>
        )}
      </main>

      {/* Dialogue pour les résultats et messages */}
      <Dialog open={dialogInfo.ouvert} onOpenChange={fermerDialog}>
        <DialogContent className="max-w-[90%] md:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogInfo.titre}</DialogTitle>
          </DialogHeader>
          <DialogDescription>{dialogInfo.message}</DialogDescription>
          <DialogFooter>
            <Button onClick={fermerDialog} className="w-full md:w-auto">
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
