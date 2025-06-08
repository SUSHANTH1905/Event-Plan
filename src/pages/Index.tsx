
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Clock, Users, Lightbulb } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EventPlan {
  title: string;
  description: string;
  timeSlots: {
    time: string;
    activity: string;
    duration: string;
  }[];
  materials: string[];
  participants: string;
}

const Index = () => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('2');
  const [numberOfPlans, setNumberOfPlans] = useState('5');
  const [eventPlans, setEventPlans] = useState<EventPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateEventPlans = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your event.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setEventPlans([]);

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDjufq3bQJWJxVvB02H3_Fe8KuI6dtnyRM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate ${numberOfPlans} different creative event plans for the topic "${topic}" with a duration of ${duration} hours. 

For each plan, provide:
1. A creative title
2. A brief description
3. Time breakdown with specific activities (split the ${duration} hours into logical segments)
4. Required materials/resources
5. Ideal number of participants

Format the response as a JSON array with this structure:
[
  {
    "title": "Event Title",
    "description": "Brief description of the event",
    "timeSlots": [
      {
        "time": "0:00 - 0:30",
        "activity": "Activity description",
        "duration": "30 minutes"
      }
    ],
    "materials": ["Material 1", "Material 2"],
    "participants": "5-10 people"
  }
]

Make sure each plan is unique and creative, with engaging activities that fit the time constraints.`
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate event plans');
      }

      const data = await response.json();
      console.log('Full API response:', data);
      
      const generatedText = data.candidates[0]?.content?.parts[0]?.text;
      console.log('Generated text:', generatedText);
      
      if (generatedText) {
        // Remove markdown code blocks if present
        let cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        console.log('Cleaned text:', cleanedText);
        
        // Extract JSON from the response - look for array brackets
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const jsonString = jsonMatch[0];
          console.log('Extracted JSON string:', jsonString);
          
          try {
            const plans = JSON.parse(jsonString);
            console.log('Parsed plans:', plans);
            
            if (Array.isArray(plans) && plans.length > 0) {
              setEventPlans(plans);
              toast({
                title: "Success!",
                description: `Generated ${plans.length} event plans for "${topic}"`,
              });
            } else {
              throw new Error('No valid plans found in response');
            }
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.log('Failed to parse JSON string:', jsonString);
            throw new Error('Failed to parse response format');
          }
        } else {
          console.error('No JSON array found in response');
          throw new Error('Invalid response format - no JSON found');
        }
      } else {
        throw new Error('No content in API response');
      }
    } catch (error) {
      console.error('Error generating event plans:', error);
      toast({
        title: "Error",
        description: `Failed to generate event plans: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Event Idea Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into amazing events! Get detailed plans with time breakdowns, activities, and everything you need to make your event successful.
          </p>
        </div>

        {/* Input Form */}
        <Card className="max-w-2xl mx-auto mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Plan Your Event</CardTitle>
            <CardDescription className="text-center">
              Enter your event topic and preferences to generate customized plans
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-medium">Event Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Team Building Workshop, Birthday Party, Coding Bootcamp..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration (hours)
                </Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="8">8 hours (Full day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plans" className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Number of Plans
                </Label>
                <Select value={numberOfPlans} onValueChange={setNumberOfPlans}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} plan{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={generateEventPlans} 
              disabled={isLoading}
              className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Amazing Plans...
                </>
              ) : (
                'Generate Event Plans'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Event Plans */}
        {eventPlans.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Your Event Plans</h2>
              <p className="text-muted-foreground">
                {eventPlans.length} creative plans for "{topic}"
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {eventPlans.map((plan, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          {plan.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {plan.description}
                        </CardDescription>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-sm font-medium text-muted-foreground">Plan {index + 1}</div>
                        <div className="text-xs text-muted-foreground mt-1">{plan.participants}</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        Schedule
                      </h4>
                      <div className="space-y-2">
                        {plan.timeSlots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
                            <div className="text-sm font-mono text-purple-700 min-w-0 flex-shrink-0">
                              {slot.time}
                            </div>
                            <div className="text-sm text-gray-700 flex-1">
                              {slot.activity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {plan.materials && plan.materials.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Required Materials</h4>
                        <div className="flex flex-wrap gap-2">
                          {plan.materials.map((material, materialIndex) => (
                            <span 
                              key={materialIndex} 
                              className="px-3 py-1 text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full border border-purple-200"
                            >
                              {material}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4 animate-pulse">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-lg font-medium">Creating amazing event plans...</p>
            <p className="text-sm text-muted-foreground mt-1">This may take a few seconds</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
