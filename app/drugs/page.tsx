"use client";

import { useState } from "react";
import { 
  Search, 
  Pill, 
  ShieldCheck, 
  ShieldX, 
  AlertTriangle,
  Info,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DrugInfo {
  name: string;
  genericName: string;
  nafdacNumber?: string;
  isVerified: boolean;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  indications: string[];
  sideEffects: string[];
  warnings: string[];
  interactions: string[];
}

interface InteractionCheck {
  drug1: string;
  drug2: string;
  severity: "none" | "mild" | "moderate" | "severe";
  description: string;
}

export default function DrugsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<DrugInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [nafdacNumber, setNafdacNumber] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ verified: boolean; drug?: DrugInfo; message?: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [drug1, setDrug1] = useState("");
  const [drug2, setDrug2] = useState("");
  const [interactionResult, setInteractionResult] = useState<InteractionCheck | null>(null);
  const [isCheckingInteraction, setIsCheckingInteraction] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setNotFound(false);
    setSearchResult(null);
    
    const response = await fetch(`/api/drugs?query=${encodeURIComponent(searchQuery.trim())}`);
    const data = await response.json();
    const result = data.drugs?.[0] as DrugInfo | undefined;

    if (response.ok && result) {
      setSearchResult(result);
    } else {
      setNotFound(true);
    }
    
    setIsSearching(false);
  };

  const handleInteractionCheck = async () => {
    if (!drug1.trim() || !drug2.trim()) return;
    
    setIsCheckingInteraction(true);
    setInteractionResult(null);
    
    const response = await fetch("/api/drugs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "check_interaction",
        drug1: drug1.trim(),
        drug2: drug2.trim(),
      }),
    });
    const data = await response.json();

    if (response.ok) {
      setInteractionResult(data);
    } else {
      setInteractionResult({
        drug1: drug1,
        drug2: drug2,
        severity: "none",
        description: data.error || "Interaction check failed. Please verify with a healthcare professional.",
      });
    }
    
    setIsCheckingInteraction(false);
  };

  const handleNafdacVerify = async () => {
    if (!nafdacNumber.trim()) return;

    setIsVerifying(true);
    setVerifyResult(null);

    const response = await fetch(`/api/drugs?nafdac=${encodeURIComponent(nafdacNumber.trim())}`);
    const data = await response.json();
    setVerifyResult(data);
    setIsVerifying(false);
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Drug Information</h1>
        <p className="text-muted-foreground">
          Search drugs, verify NAFDAC registration, and check interactions
        </p>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" />
            Search Drug
          </TabsTrigger>
          <TabsTrigger value="verify" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            NAFDAC Verify
          </TabsTrigger>
          <TabsTrigger value="interaction" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Interactions
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter drug name (e.g., Paracetamol)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {notFound && (
            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardContent className="flex items-center gap-3 py-4">
                <Info className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium text-foreground">Drug not found</p>
                  <p className="text-sm text-muted-foreground">
                    Try searching with a different name or check the spelling
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {searchResult && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-primary" />
                      {searchResult.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {searchResult.genericName} | {searchResult.strength} {searchResult.dosageForm}
                    </p>
                  </div>
                  {searchResult.isVerified ? (
                    <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-xs font-medium">NAFDAC Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-destructive">
                      <ShieldX className="h-4 w-4" />
                      <span className="text-xs font-medium">Not Verified</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Manufacturer</p>
                    <p className="text-foreground">{searchResult.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">NAFDAC Number</p>
                    <p className="text-foreground">{searchResult.nafdacNumber || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Uses</p>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.indications.map((indication) => (
                      <span
                        key={indication}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                      >
                        {indication}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Side Effects</p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {searchResult.sideEffects.map((effect) => (
                      <li key={effect}>{effect}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg bg-amber-500/10 p-3">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    Warnings
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {searchResult.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* NAFDAC Verify Tab */}
        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                NAFDAC Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter a NAFDAC registration number to verify if a drug is legitimately 
                registered with the National Agency for Food and Drug Administration and Control.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter NAFDAC number (e.g., A4-1234567)"
                  value={nafdacNumber}
                  onChange={(e) => setNafdacNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNafdacVerify()}
                />
                <Button onClick={handleNafdacVerify} disabled={isVerifying || !nafdacNumber.trim()}>
                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                </Button>
              </div>
              {verifyResult ? (
                <div className={`rounded-lg p-4 ${verifyResult.verified ? "bg-green-100 dark:bg-green-900/20" : "bg-destructive/10"}`}>
                  <div className="flex items-start gap-3">
                    {verifyResult.verified ? (
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {verifyResult.verified ? "NAFDAC registration found" : "NAFDAC number not found"}
                      </p>
                      {verifyResult.drug ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {verifyResult.drug.name} by {verifyResult.drug.manufacturer}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {verifyResult.message || "Please confirm the number and consult a pharmacist if unsure."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted p-4 text-center">
                  <Info className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Enter a NAFDAC number above to check verification status
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interaction Check Tab */}
        <TabsContent value="interaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Drug Interaction Checker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Check for potential interactions between two medications before taking them together.
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    First Drug
                  </label>
                  <Input
                    placeholder="e.g., Paracetamol"
                    value={drug1}
                    onChange={(e) => setDrug1(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Second Drug
                  </label>
                  <Input
                    placeholder="e.g., Ibuprofen"
                    value={drug2}
                    onChange={(e) => setDrug2(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleInteractionCheck}
                disabled={isCheckingInteraction || !drug1 || !drug2}
                className="w-full"
              >
                {isCheckingInteraction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Interaction"
                )}
              </Button>

              {interactionResult && (
                <div
                  className={`rounded-lg p-4 ${
                    interactionResult.severity === "none"
                      ? "bg-green-100 dark:bg-green-900/20"
                      : interactionResult.severity === "mild"
                      ? "bg-amber-100 dark:bg-amber-900/20"
                      : "bg-destructive/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {interactionResult.severity === "none" ? (
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {interactionResult.drug1} + {interactionResult.drug2}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {interactionResult.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
