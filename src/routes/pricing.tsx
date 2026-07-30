import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pricing")({
  component: Pricing,
});

function Pricing() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple, transparent pricing</p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose the plan that's right for your business. All plans include our core AI features.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`flex flex-col justify-between rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10 ${
                tier.featured ? 'bg-gray-900 ring-gray-900 text-white' : 'bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    id={tier.id}
                    className={`text-lg font-semibold leading-8 ${
                      tier.featured ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {tier.name}
                  </h3>
                  {tier.mostPopular ? (
                    <p className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold leading-5 text-white">
                      Most popular
                    </p>
                  ) : null}
                </div>
                <p className={`mt-4 text-sm leading-6 ${tier.featured ? 'text-gray-300' : 'text-gray-600'}`}>
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className={`text-4xl font-bold tracking-tight ${tier.featured ? 'text-white' : 'text-gray-900'}`}>
                    ${tier.priceMonthly}
                  </span>
                  <span className={`text-sm font-semibold leading-6 ${tier.featured ? 'text-gray-300' : 'text-gray-600'}`}>
                    /month
                  </span>
                </p>
                <ul
                  role="list"
                  className={`mt-8 space-y-3 text-sm leading-6 ${
                    tier.featured ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <svg
                        className={`h-6 w-5 flex-none ${tier.featured ? 'text-indigo-400' : 'text-indigo-600'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.176a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="#"
                aria-describedby={tier.id}
                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.featured
                    ? 'bg-indigo-500 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-indigo-500'
                    : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600'
                }`}
              >
                Get started
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    priceMonthly: '199',
    description: 'Perfect for small businesses just getting started with AI automation.',
    features: ['Up to 100 conversations/mo', 'Always-on lead capture', 'Instant response', 'Web chat & Text'],
    featured: false,
    mostPopular: false,
  },
  {
    name: 'Growth',
    id: 'tier-growth',
    priceMonthly: '499',
    description: 'Best for growing businesses that need more volume and advanced features.',
    features: [
      'Up to 500 conversations/mo',
      'Appointment booking',
      'Missed call recovery',
      'Review requests',
      'All channels (SMS, Web, Social, Email)',
    ],
    featured: true,
    mostPopular: true,
  },
  {
    name: 'Scale',
    id: 'tier-scale',
    priceMonthly: '999',
    description: 'For high-volume businesses with complex automation needs.',
    features: [
      'Unlimited conversations',
      'Custom follow-up sequences',
      'Advanced CRM integrations',
      'Dedicated account manager',
      'Priority support',
    ],
    featured: false,
    mostPopular: false,
  },
]
