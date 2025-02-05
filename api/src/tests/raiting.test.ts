import { setGameResults } from '../services/game.service';
import prisma from '../utils/prisma';
import { inGameCache, gamesCache } from '../constants';

describe('Raiting test', () => {
    it('check prisma', async () => {
        expect(await prisma.playedGame !== undefined); 
    })
});