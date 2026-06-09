import { ArrowRight } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/shadcn/ui/accordion'
import { Sheet, SheetContent, SheetTitle } from '#/components/shadcn/ui/sheet'

const KNOCKOUT_STAGE_POINTS = [
  { stage: 'Round of 32', points: 5 },
  { stage: 'Round of 16', points: 10 },
  { stage: 'Quarter Finals', points: 15 },
  { stage: 'Semi Finals', points: 20 },
  { stage: 'Third Place', points: 25 },
  { stage: 'Final', points: 30 },
]


const FAQ = [
  {
    q: 'How are match score predictions scored?',
    a: 'Predict the exact final score and earn 5 points. Predict the correct result (win/draw/loss) without the exact score and earn 3 point. Incorrect predictions earn 0 points.',
  },
  {
    q: 'How are group stage bracket predictions scored?',
    a: 'Predict a team to finish 1st in their group and earn 3 points. Predict 2nd, 3rd, or 4th place correctly and earn 1 point each.',
  },
  {
    q: 'How are knockout stage predictions scored?',
    a: (
      <div className="flex flex-col gap-2">
        <p>Predict the winner of a knockout match correctly. Points increase each round:</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {KNOCKOUT_STAGE_POINTS.map(({ stage, points }) => (
            <div key={stage} className="contents">
              <span>{stage}</span>
              <span className="font-medium text-foreground">{points} pts</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    q: 'What is the Overall?',
    a: 'Your Overall is the sum of all your group stage, knockout, and match prediction points combined.',
  },
  {
    q: 'Can I change my match predictions?',
    a: 'Yes — you can edit your predictions any time up to 1 hour before a match kicks off. Once within that window your prediction for that game is locked in.',
  },
  {
    q: 'Can I change my group/knockout stage predictions?',
    a: 'Yes — you can edit your predictions up to 1 hour before the first match of that stage kicks off. Once within that window your predictions for that stage are locked in.',
  },
  {
    q: 'Can I change my group/knockout stage predictions?',
    a: 'Yes — you can edit your predictions up to 1 hour before the first match of that stage kicks off. Once within that window your predictions for that stage are locked in.',
  },
  {
    q: 'I have a complaint about the application?',
    a: 'Please direct it to the recreation club members.',
  }
]

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

export function HelpSheet({ open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="!bg-background w-full! max-w-full! overflow-y-auto no-scrollbar p-0 flex flex-col"
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">How It Works</SheetTitle>
        <div className="flex items-center gap-2 px-3 py-4 border-b shrink-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="size-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowRight className="size-4" />
          </button>
          <span className="font-semibold text-base">How It Works</span>
        </div>
        <Accordion type="single" collapsible className="px-4 pb-6">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-sm text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SheetContent>
    </Sheet>
  )
}
