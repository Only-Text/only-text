# UI Blocks Library

Deze library bevat verschillende UI blokken die gebruikt kunnen worden voor SEO-geoptimaliseerde pagina's.

## 1. Bento Grid Layout

**Gebruik:** Feature showcase met verschillende groottes
**Kenmerken:** 3 kolommen, 2 rijen, responsive, verschillende card groottes

```jsx
export default function BentoGrid() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-center text-base/7 font-semibold text-indigo-400">Deploy faster</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
          Everything you need to deploy your app
        </p>
        <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
          <div className="relative lg:row-span-2">
            <div className="absolute inset-px rounded-lg bg-gray-800 lg:rounded-l-4xl" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
              <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-white max-lg:text-center">Mobile friendly</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400 max-lg:text-center">
                  Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.
                </p>
              </div>
              <div className="@container relative min-h-120 w-full grow max-lg:mx-auto max-lg:max-w-sm">
                {/* Content here */}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15 lg:rounded-l-4xl" />
          </div>
          <div className="relative max-lg:row-start-1">
            <div className="absolute inset-px rounded-lg bg-gray-800 max-lg:rounded-t-4xl" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-white max-lg:text-center">Performance</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400 max-lg:text-center">
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit maiores impedit.
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center px-8 max-lg:pt-10 max-lg:pb-12 sm:px-10 lg:pb-2">
                {/* Content here */}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15 max-lg:rounded-t-4xl" />
          </div>
          {/* More grid items... */}
        </div>
      </div>
    </div>
  )
}
```

## 2. Feature Grid with Icons

**Gebruik:** 3-kolom feature grid met icons en links
**Kenmerken:** Icons, descriptions, "Learn more" links

```jsx
import { ArrowPathIcon, CloudArrowUpIcon, LockClosedIcon } from '@heroicons/react/20/solid'

const features = [
  {
    name: 'Push to deploy',
    description: 'Commodo nec sagittis tortor mauris sed. Turpis tortor quis scelerisque diam id accumsan nullam tempus.',
    href: '#',
    icon: CloudArrowUpIcon,
  },
  // More features...
]

export default function FeatureGrid() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-indigo-400">Deploy faster</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl lg:text-balance">
            Everything you need to deploy your app
          </p>
          <p className="mt-6 text-lg/8 text-gray-300">
            Quis tellus eget adipiscing convallis sit sit eget aliquet quis.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-white">
                  <feature.icon aria-hidden="true" className="size-5 flex-none text-indigo-400" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-400">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <a href={feature.href} className="text-sm/6 font-semibold text-indigo-400 hover:text-indigo-300">
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
```

## 3. Two Column Feature with List

**Gebruik:** 2-kolom layout met feature list en visueel element
**Kenmerken:** Inline icons, description list, side-by-side layout

```jsx
import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'

const features = [
  {
    name: 'Push to deploy.',
    description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit.',
    icon: CloudArrowUpIcon,
  },
  // More features...
]

export default function TwoColumnFeature() {
  return (
    <div className="overflow-hidden bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:grid-cols-2 lg:items-start">
          <div className="px-6 lg:px-0 lg:pt-4 lg:pr-4">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-indigo-400">Deploy faster</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
                A better workflow
              </p>
              <p className="mt-6 text-lg/8 text-gray-300">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-400 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-white">
                      <feature.icon aria-hidden="true" className="absolute top-1 left-1 size-5 text-indigo-400" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="sm:px-6 lg:px-0">
            {/* Visual element here */}
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 4. Testimonial Bento Grid

**Gebruik:** Featured testimonial met grid layout
**Kenmerken:** Verschillende groottes, featured item, avatar images

```jsx
const featuredTestimonial = {
  body: 'Integer id nunc sit semper purus. Bibendum at lacus ut arcu blandit montes vitae auctor libero.',
  author: {
    name: 'Brenna Goyette',
    handle: 'brennagoyette',
    imageUrl: 'https://images.unsplash.com/photo-1550525811-e5869dd03032...',
    logoUrl: 'https://tailwindcss.com/plus-assets/img/logos/savvycal-logo-gray-900.svg',
  },
}

const testimonials = [
  [
    [
      {
        body: 'Laborum quis quam. Dolorum et ut quod quia.',
        author: {
          name: 'Leslie Alexander',
          handle: 'lesliealexander',
          imageUrl: 'https://images.unsplash.com/photo-1494790108377...',
        },
      },
      // More testimonials...
    ],
  ],
]

export default function TestimonialBentoGrid() {
  return (
    <div className="relative isolate bg-gray-900 pt-24 pb-32 sm:pt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base/7 font-semibold text-indigo-400">Testimonials</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
            We have worked with thousands of amazing people
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm/6 text-gray-100 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4">
          <figure className="rounded-2xl bg-gray-800/75 ring-1 ring-white/10 sm:col-span-2 xl:col-start-2 xl:row-end-1">
            <blockquote className="p-6 text-lg font-semibold tracking-tight text-white sm:p-12 sm:text-xl/8">
              <p>{`"${featuredTestimonial.body}"`}</p>
            </blockquote>
            <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-white/10 px-6 py-4 sm:flex-nowrap">
              <img
                alt=""
                src={featuredTestimonial.author.imageUrl}
                className="size-10 flex-none rounded-full bg-gray-700"
              />
              <div className="flex-auto">
                <div className="font-semibold text-white">{featuredTestimonial.author.name}</div>
                <div className="text-gray-400">{`@${featuredTestimonial.author.handle}`}</div>
              </div>
            </figcaption>
          </figure>
          {/* More testimonials grid... */}
        </div>
      </div>
    </div>
  )
}
```

## 5. Testimonial Masonry Grid

**Gebruik:** Masonry-style testimonial layout
**Kenmerken:** CSS columns, responsive, flowing layout

```jsx
const testimonials = [
  {
    body: 'Laborum quis quam. Dolorum et ut quod quia.',
    author: {
      name: 'Leslie Alexander',
      handle: 'lesliealexander',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377...',
    },
  },
  // More testimonials...
]

export default function TestimonialMasonry() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base/7 font-semibold text-indigo-400">Testimonials</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
            We have worked with thousands of amazing people
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="-mt-8 sm:-mx-4 sm:columns-2 sm:text-[0] lg:columns-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author.handle} className="pt-8 sm:inline-block sm:w-full sm:px-4">
                <figure className="rounded-2xl bg-white/2.5 p-8 text-sm/6">
                  <blockquote className="text-gray-100">
                    <p>{`"${testimonial.body}"`}</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <img alt="" src={testimonial.author.imageUrl} className="size-10 rounded-full bg-gray-800" />
                    <div>
                      <div className="font-semibold text-white">{testimonial.author.name}</div>
                      <div className="text-gray-400">{`@${testimonial.author.handle}`}</div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 6. Content with Centered Max-Width (Current Implementation)

**Gebruik:** Centered text content met max-width voor leesbaarheid
**Kenmerken:** Max-w-3xl, centered headers, intro paragraphs

```jsx
export default function CenteredContent() {
  return (
    <div className="mt-16">
      <div className="mx-auto max-w-3xl text-center">
        <Heading level={2} className="mb-4 text-3xl font-bold">Section Title</Heading>
        <Text className="mb-10 text-lg text-zinc-600 dark:text-zinc-400">
          Introduction paragraph with larger text for better readability.
        </Text>
      </div>
      
      <div className="mx-auto max-w-3xl">
        <div className="space-y-6">
          <div className="flex gap-x-4">
            <CheckCircleIcon className="mt-1 h-6 w-6 flex-none text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Feature Title</h3>
              <Text className="mt-1 text-zinc-600 dark:text-zinc-400">
                Feature description with good spacing and readability.
              </Text>
            </div>
          </div>
          {/* More items... */}
        </div>
      </div>
    </div>
  )
}
```

## 7. Gradient Hero with Badges

**Gebruik:** Hero section met badges en stat cards
**Kenmerken:** SVG pattern background, badges, icon cards

```jsx
export default function GradientHero() {
  return (
    <div className="relative isolate mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 py-16 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-20">
        <svg
          aria-hidden="true"
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-zinc-200 dark:stroke-zinc-700"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="pattern-id"
              width={200}
              height={200}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <rect fill="url(#pattern-id)" width="100%" height="100%" strokeWidth={0} />
        </svg>
      </div>
      
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <Badge color="blue">New</Badge>
          <Badge color="green">Completely Free</Badge>
          <Badge color="purple">AI-Powered</Badge>
        </div>
        
        <Heading level={2} className="mb-6 text-3xl font-bold">
          Section Title
        </Heading>
        
        <Text className="mb-6 text-lg">
          Introduction text with good spacing.
        </Text>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 dark:bg-zinc-800/80">
            <SparklesIcon className="h-6 w-6 flex-none text-blue-600 dark:text-blue-400" />
            <div>
              <div className="font-semibold text-zinc-900 dark:text-white">Feature</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Detail</div>
            </div>
          </div>
          {/* More stat cards... */}
        </div>
      </div>
    </div>
  )
}
```

## Usage Tips

1. **Bento Grid**: Gebruik voor feature showcases waar je verschillende groottes wilt benadrukken
2. **Feature Grid**: Ideaal voor 3-6 features met icons en korte descriptions
3. **Two Column**: Perfect voor gedetailleerde feature explanations met visueel element
4. **Testimonial Bento**: Gebruik wanneer je één featured testimonial wilt highlighten
5. **Testimonial Masonry**: Beste voor veel testimonials in een compacte layout
6. **Centered Content**: Gebruik voor text-heavy content met goede leesbaarheid
7. **Gradient Hero**: Perfect voor hero sections of belangrijke call-to-actions

## Color Schemes

- **Indigo/Blue**: Professional, tech-focused
- **Purple/Pink**: Creative, modern
- **Green/Emerald**: Success, growth
- **Amber/Orange**: Energy, attention
- **Gray/Zinc**: Neutral, elegant
