'use client'

import Link from 'next/link'
import { AnimatedButton } from '@/components/animated-button'
import { Sparkles, Image as ImageIcon, Zap } from 'lucide-react'
import { FadeIn, FadeInStagger, FadeInItem } from '@/components/animations/fade-in'
import { SlideIn } from '@/components/animations/slide-in'

export function LandingHero() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <FadeIn>
          <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Turn Your Ideas Into
            <span className="block text-primary mt-2">3D-Ready AI Images</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate images optimized for 3D model creation. Powered by OpenAI's DALL-E 3 
            with automatic white background for seamless Meshy API integration.
          </p>
        </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <AnimatedButton size="lg" className="text-lg px-8">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </AnimatedButton>
            </Link>
            <Link href="/login">
              <AnimatedButton size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </AnimatedButton>
            </Link>
          </div>
        </FadeIn>

        <FadeInStagger>
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <FadeInItem>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">
                  Leveraging OpenAI's latest DALL-E 3 model for photorealistic results
                </p>
              </div>
            </FadeInItem>

            <FadeInItem>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">Your Gallery</h3>
                <p className="text-sm text-muted-foreground">
                  All your generated images saved securely in your personal gallery
                </p>
              </div>
            </FadeInItem>

            <FadeInItem>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Generate high-quality images in seconds, not hours
                </p>
              </div>
            </FadeInItem>
          </div>
        </FadeInStagger>

        <SlideIn direction="up" delay={0.4}>
          <div className="mt-16 p-8 rounded-lg border bg-muted/50">
          <h3 className="text-2xl font-semibold mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2">
              <div className="font-bold text-primary text-lg">1. Describe</div>
              <p className="text-sm text-muted-foreground">
                Write a detailed description of the image you want to create
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-primary text-lg">2. Generate</div>
              <p className="text-sm text-muted-foreground">
                Our AI processes your prompt and creates a unique image
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-primary text-lg">3. Download</div>
              <p className="text-sm text-muted-foreground">
                Preview, download, and share your AI-generated masterpiece
              </p>
            </div>
          </div>
        </div>
        </SlideIn>
      </div>
    </div>
  )
}

