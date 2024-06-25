import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer';

const router = express.Router();

interface ScrapeResult {
    label: string | undefined;
    website: string | undefined;
    description: string | undefined;
    street: string | undefined;
    postalCode: string | undefined;
    city: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    name: string | undefined;
    firstname: string | undefined;
}

router.get('/', async (req: Request, res: Response) => {
    try {
        const url: string | undefined = req.query.url as string;
        if (!url) {
            return res.status(400).send('URL query parameter is required');
        }

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const result: ScrapeResult = await page.evaluate(() => {
            const cssPaths: Record<string, string> = {
                label: ".um-field-last_name .um-field-value",
                website: ".um-meta a",
                description: ".um-field-club_presentation .um-field-value",
                street: ".um-field-club_adresse .um-field-value",
                postalCode: ".um-field-club_code_postal .um-field-value",
                city: ".um-field-club_ville_select .um-field-value",
                email: ".um-field-contact_club_mail .um-field-value",
                phone: ".um-field-contact_club_tel .um-field-value",
                name: ".um-field-contact_club_nom .um-field-value",
                firstname: ".um-field-contact_club_prenom .um-field-value"
            }

            const result: ScrapeResult = {
                label: undefined,
                website: undefined,
                description: undefined,
                street: undefined,
                postalCode: undefined,
                city: undefined,
                email: undefined,
                phone: undefined,
                name: undefined,
                firstname: undefined
            }

            for (const [key, value] of Object.entries(cssPaths)) {
                const element = document.querySelector(value);
                if (element) {
                    const resultKey = key as keyof ScrapeResult;
                    (result[resultKey] as string | null) = key === 'website' ? element.getAttribute('href') : element.textContent;
                }
            }

            return result;
        });

        await browser.close();

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

export default router;
