import TCGdex from "@tcgdex/sdk"

export const tcgdex = new TCGdex("en")

tcgdex.setCacheTTL(3600)
