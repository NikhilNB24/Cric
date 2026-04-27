import { BadRequestException } from '@nestjs/common';
import { DismissalType } from '@prisma/client';
import { ScoringService } from './scoring.service';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(() => {
    service = new ScoringService({} as never);
  });

  describe('submit ball validation', () => {
    const validBallInput = {
      inningsId: 'innings-1',
      strikerId: 'striker-1',
      nonStrikerId: 'non-striker-1',
      bowlerId: 'bowler-1',
      scoredById: 'scorer-1',
      runsBat: 1,
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      penaltyRuns: 0,
      isWicket: false,
      idempotencyKey: 'ball-1',
    };

    it('rejects negative run values', async () => {
      await expect(
        service.submitBall({
          ...validBallInput,
          runsBat: -1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a delivery marked as both wide and no-ball', async () => {
      await expect(
        service.submitBall({
          ...validBallInput,
          wides: 1,
          noBalls: 1,
        }),
      ).rejects.toThrow('A delivery cannot be both wide and no-ball.');
    });

    it('requires a dismissal type when the ball is a wicket', async () => {
      await expect(
        service.submitBall({
          ...validBallInput,
          isWicket: true,
        }),
      ).rejects.toThrow('dismissalType is required for wickets.');
    });

    it('requires a fielder when dismissal type is caught', async () => {
      await expect(
        service.submitBall({
          ...validBallInput,
          isWicket: true,
          dismissalType: DismissalType.CAUGHT,
          playerOutId: 'striker-1',
        }),
      ).rejects.toThrow('fielderId is required for caught wickets.');
    });

    it('allows a wicket when dismissal type is provided', async () => {
      const transaction = jest.fn();
      service = new ScoringService({ $transaction: transaction } as never);

      await service.submitBall({
        ...validBallInput,
        isWicket: true,
        dismissalType: DismissalType.BOWLED,
      });

      expect(transaction).toHaveBeenCalledTimes(1);
    });
  });
});
