
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  InfoIcon, 
  FileText,
  ArrowRight,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Insurance = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const insuranceDetails = {
    provider: "HealthGuard Insurance",
    planName: "Premium Health Plus",
    policyNumber: "HGP-12345678",
    coverageStart: "January 1, 2023",
    coverageEnd: "December 31, 2023",
    status: "Active",
    primaryCareCopay: "$20",
    specialistCopay: "$40",
    emergencyRoomCopay: "$100",
    annualDeductible: "$1,000",
    outOfPocketMax: "$5,000",
    coveragePercentage: "80%"
  };
  
  const faqs = [
    {
      question: "How do I find in-network doctors?",
      answer: "You can find in-network doctors by logging into your HealthGuard Insurance account or using the mobile app. You can also call the customer service number on the back of your insurance card."
    },
    {
      question: "What services require pre-authorization?",
      answer: "Services that typically require pre-authorization include hospital admissions, outpatient surgeries, advanced imaging (MRI, CT scans), and certain medications. Always check with your insurance provider before scheduling these services."
    },
    {
      question: "How do I submit a claim?",
      answer: "Most providers will submit claims directly to your insurance company. If you need to submit a claim yourself, log into your online account, download the claim form, fill it out, and submit it along with an itemized bill from your provider."
    },
    {
      question: "What is not covered by my insurance?",
      answer: "Common exclusions include cosmetic procedures, experimental treatments, and services deemed not medically necessary. Refer to your policy documents for a complete list of exclusions."
    },
    {
      question: "How can I estimate my out-of-pocket costs?",
      answer: "You can use the cost estimator tool on your insurance provider's website or mobile app. You can also call the customer service number for assistance with estimating costs for specific procedures."
    }
  ];

  return (
    <div className="space-y-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Insurance</h1>
          <p className="text-muted-foreground">Manage and understand your health insurance coverage</p>
        </div>
        <Button className="rounded-full">
          Contact Support
        </Button>
      </div>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto py-2 gap-2 border-b">
        <Button 
          variant={activeTab === "overview" ? "default" : "ghost"} 
          className="rounded-full" 
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </Button>
        <Button 
          variant={activeTab === "coverage" ? "default" : "ghost"} 
          className="rounded-full" 
          onClick={() => setActiveTab("coverage")}
        >
          Coverage Details
        </Button>
        <Button 
          variant={activeTab === "claims" ? "default" : "ghost"} 
          className="rounded-full" 
          onClick={() => setActiveTab("claims")}
        >
          Claims
        </Button>
        <Button 
          variant={activeTab === "faq" ? "default" : "ghost"} 
          className="rounded-full" 
          onClick={() => setActiveTab("faq")}
        >
          FAQs
        </Button>
      </div>
      
      {/* Overview Tab */}
      {/* {activeTab === "overview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Insurance Overview
              </CardTitle>
              <CardDescription>
                Your current health insurance plan details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Provider</p>
                    <p className="font-medium">{insuranceDetails.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plan Name</p>
                    <p className="font-medium">{insuranceDetails.planName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Policy Number</p>
                    <p className="font-medium">{insuranceDetails.policyNumber}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Coverage Period</p>
                    <p className="font-medium">{insuranceDetails.coverageStart} - {insuranceDetails.coverageEnd}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="inline-flex items-center font-medium">
                      <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                      {insuranceDetails.status}
                    </p>
                  </div>
                  <div>
                    <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("coverage")}>
                      View full coverage details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Button variant="ghost" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Download ID Card
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      View Benefits
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Check Claim Status
                    </Button>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Annual Physical</p>
                      <p className="text-xs text-muted-foreground">Apr 15, 2023</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Approved
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Specialist Visit</p>
                      <p className="text-xs text-muted-foreground">Mar 22, 2023</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Processing
                    </span>
                  </div>
                </div>
                <Button variant="link" className="mt-2 p-0 h-auto" onClick={() => setActiveTab("claims")}>
                  View all claims
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm">Contact your insurance provider for assistance:</p>
                  <p className="text-sm font-medium">
                    Customer Service: (800) 123-4567
                  </p>
                  <Button className="w-full rounded-full">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Get Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
       */}
      {/* Coverage Details Tab */}
      {/* {activeTab === "coverage" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Details</CardTitle>
              <CardDescription>
                Understand what your insurance plan covers and your costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Plan Information</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="font-medium">{insuranceDetails.provider}</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Plan Name</span>
                      <span className="font-medium">{insuranceDetails.planName}</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Policy Number</span>
                      <span className="font-medium">{insuranceDetails.policyNumber}</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Coverage Period</span>
                      <span className="font-medium">{insuranceDetails.coverageStart} - {insuranceDetails.coverageEnd}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Network Type</span>
                      <span className="font-medium">PPO</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Cost Sharing</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center pb-2 border-b">
                      <div className="flex items-center">
                        <span className="text-muted-foreground">Annual Deductible</span>
                        <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{insuranceDetails.annualDeductible}</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <div className="flex items-center">
                        <span className="text-muted-foreground">Out-of-Pocket Maximum</span>
                        <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{insuranceDetails.outOfPocketMax}</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Coinsurance</span>
                      <span className="font-medium">{insuranceDetails.coveragePercentage}</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Primary Care Copay</span>
                      <span className="font-medium">{insuranceDetails.primaryCareCopay}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Specialist Copay</span>
                      <span className="font-medium">{insuranceDetails.specialistCopay}</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-3">Service Coverage</h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-start">
                    <InfoIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      This is a summary of your coverage. For detailed information, please refer to your policy documents or contact customer service.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-3 rounded-lg border">
                      <h4 className="font-medium flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Covered Services
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                          Preventive care (100% covered)
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                          Primary care visits
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                          Specialist visits
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                          Emergency services
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                          Hospital stays
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-3 rounded-lg border">
                      <h4 className="font-medium flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                        Not Covered Services
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                          Cosmetic procedures
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                          Experimental treatments
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                          Non-medically necessary services
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                          Long-term custodial care
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
       */}
      {/* Claims Tab */}
      {/* {activeTab === "claims" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Claims History</CardTitle>
              <CardDescription>
                Track the status of your submitted claims
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Service Date</th>
                      <th className="text-left py-3 px-2">Provider</th>
                      <th className="text-left py-3 px-2">Service Description</th>
                      <th className="text-left py-3 px-2">Billed Amount</th>
                      <th className="text-left py-3 px-2">Insurance Paid</th>
                      <th className="text-left py-3 px-2">Your Responsibility</th>
                      <th className="text-left py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-2">Apr 15, 2023</td>
                      <td className="py-3 px-2">Dr. Sarah Johnson</td>
                      <td className="py-3 px-2">Annual Physical</td>
                      <td className="py-3 px-2">$250.00</td>
                      <td className="py-3 px-2">$250.00</td>
                      <td className="py-3 px-2">$0.00</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Approved
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">Mar 22, 2023</td>
                      <td className="py-3 px-2">Dr. Emily Rodriguez</td>
                      <td className="py-3 px-2">Specialist Visit</td>
                      <td className="py-3 px-2">$175.00</td>
                      <td className="py-3 px-2">$135.00</td>
                      <td className="py-3 px-2">$40.00</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Processing
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">Feb 10, 2023</td>
                      <td className="py-3 px-2">City Pharmacy</td>
                      <td className="py-3 px-2">Prescription Medication</td>
                      <td className="py-3 px-2">$75.50</td>
                      <td className="py-3 px-2">$60.40</td>
                      <td className="py-3 px-2">$15.10</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Approved
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">Jan 05, 2023</td>
                      <td className="py-3 px-2">Urgent Care Center</td>
                      <td className="py-3 px-2">Urgent Care Visit</td>
                      <td className="py-3 px-2">$325.00</td>
                      <td className="py-3 px-2">$260.00</td>
                      <td className="py-3 px-2">$65.00</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Approved
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6">
                <Button className="rounded-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit New Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
       */}
      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Answers to common insurance questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <h3 className="font-medium mb-2 flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                  Still have questions?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Contact your insurance provider's customer service for personalized assistance.
                </p>
                <Button className="rounded-full">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Insurance;
