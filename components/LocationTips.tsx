"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Info, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LocationTipsProps {
  location: {
    city: string
    country: string
    latitude: number
    longitude: number
  }
}

export default function LocationTips({ location }: LocationTipsProps) {
  // Enhanced location-specific recycling data
  const getLocationTips = (city: string, country: string) => {
    const cityKey = city.toLowerCase()
    const countryKey = country.toLowerCase()

    const tips = {
      // Indian cities
      mumbai: {
        recyclable: ["PET #1 bottles", "HDPE #2 containers", "Paper", "Cardboard", "Glass bottles"],
        notRecyclable: ["Multilayer packaging", "Tetra packs", "Styrofoam", "Chip packets"],
        specialInstructions:
          "Mumbai has separate collection for wet and dry waste. BMC requires segregation at source. Clean packaging before disposal.",
        facilities: "BMC recycling centers accept most plastic types #1-7. Drop-off points available in each ward.",
        website: "https://portal.mcgm.gov.in/",
      },
      delhi: {
        recyclable: ["PET #1 bottles", "Paper", "Cardboard", "Glass", "Metal cans"],
        notRecyclable: ["Multilayer foil packaging", "Mixed material pouches", "Laminated paper"],
        specialInstructions:
          "Delhi requires segregation at source. Use green bins for wet waste, blue for dry recyclables. DPCC guidelines apply.",
        facilities: "Delhi Pollution Control Committee approved centers. MCD collection points in each zone.",
        website: "https://dpcc.delhigovt.nic.in/",
      },
      pune: {
        recyclable: ["All plastic types #1-7", "Paper", "Cardboard", "Metal cans", "Glass"],
        notRecyclable: ["Laminated packaging", "Chip packets", "Mixed material wraps"],
        specialInstructions:
          "PMC has door-to-door collection for segregated waste. Composting encouraged for organic waste.",
        facilities: "PMC waste processing plants accept most recyclables. Citizen collection centers available.",
        website: "https://pmc.gov.in/",
      },
      bangalore: {
        recyclable: ["PET bottles", "HDPE containers", "Paper", "Cardboard", "Glass", "Aluminum"],
        notRecyclable: ["Multilayer packaging", "Tetra packs", "Thermocol"],
        specialInstructions: "BBMP mandates waste segregation. Dry waste collection on alternate days.",
        facilities: "BBMP dry waste collection centers. Hasiru Dala pickup services available.",
        website: "https://bbmp.gov.in/",
      },
      // International cities
      "new york": {
        recyclable: ["Plastic #1-7", "Paper", "Cardboard", "Glass", "Metal cans"],
        notRecyclable: ["Plastic bags", "Styrofoam", "Food-soiled paper"],
        specialInstructions: "NYC requires single-stream recycling. No need to separate materials.",
        facilities: "Curbside pickup available. Drop-off centers in all boroughs.",
        website: "https://www1.nyc.gov/assets/dsny/site/services/recycling",
      },
      london: {
        recyclable: ["Plastic bottles", "Paper", "Cardboard", "Glass", "Metal cans"],
        notRecyclable: ["Black plastic", "Crisp packets", "Polystyrene"],
        specialInstructions: "Different boroughs have different collection days. Check your local council.",
        facilities: "Household waste recycling centers available. Council collection services.",
        website: "https://www.london.gov.uk/what-we-do/environment/waste-and-recycling",
      },
      // Default fallback
      default: {
        recyclable: ["PET #1 bottles", "HDPE #2 containers", "Paper", "Cardboard"],
        notRecyclable: ["Mixed material packaging", "Laminated pouches", "Styrofoam"],
        specialInstructions: "Check with local waste management authorities for specific guidelines in your area.",
        facilities: "Contact local municipal corporation for recycling center locations and collection schedules.",
        website: null,
      },
    }

    // Try city first, then country, then default
    return tips[cityKey as keyof typeof tips] || tips[countryKey as keyof typeof tips] || tips.default
  }

  const locationData = getLocationTips(location.city, location.country)

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 rounded-t-lg">
        <CardTitle className="text-green-800 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          ♻️ Recycling Tips for {location.city}, {location.country}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">✅ Recyclable in Your Area</h4>
              <ul className="text-sm text-green-700 space-y-1">
                {locationData.recyclable.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">❌ Not Recyclable Locally</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {locationData.notRecyclable.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Local Guidelines
              </h4>
              <p className="text-sm text-blue-700">{locationData.specialInstructions}</p>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">🏢 Recycling Facilities</h4>
              <p className="text-sm text-amber-700 mb-3">{locationData.facilities}</p>
              {locationData.website && (
                <Button
                  onClick={() => window.open(locationData.website!, "_blank")}
                  variant="outline"
                  size="sm"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Official Guidelines
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
