import { ArrowRight } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/shadcn/ui/accordion'
import { Sheet, SheetContent, SheetTitle } from '#/components/shadcn/ui/sheet'

const FAQ = [
  {
    q: 'How are match score predictions scored?',
    a: 'Predict the exact final score and earn 3 points. Predict the correct result (win/draw/loss) without the exact score and earn 1 point. Incorrect predictions earn 0 points.',
  },
  {
    q: 'How are group stage bracket predictions scored?',
    a: 'Predict a team to finish 1st in their group and earn 3 points. Predict 2nd, 3rd, or 4th place correctly and earn 1 point each.',
  },
  {
    q: 'How are knockout stage predictions scored?',
    a: 'Predict the winner of a knockout match correctly. Points increase each round — later rounds are worth more. Points per round are set by the competition organisers.',
  },
  {
    q: 'What is the total score?',
    a: 'Your total score is the sum of all your group stage, knockout, and match prediction points combined.',
  },
  {
    q: 'Can I change my predictions?',
    a: 'Yes — you can edit your predictions any time before a match kicks off. Once a match is underway your prediction for that game is locked in.',
  },
]

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

export function HelpSheet({ open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="!bg-background w-full! max-w-full! overflow-y-auto p-0 flex flex-col"
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
