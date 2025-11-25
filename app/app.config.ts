export default defineAppConfig({
  ui: {
    button: {
      slots: {
        base: 'cursor-pointer active:scale-[0.99] transition-transform duration-150'
      },
      defaultVariants: {
        color: 'neutral'
      }
    },
    badge: {
      defaultVariants: {
        color: 'neutral'
      }
    },
    colors: {
      neutral: 'neutral'
    },
    navigationMenu: {
      slots: {
        link: 'px-2.5 py-2 gap-2.5',
        linkLeadingIcon: 'size-4.5'
      }
    },
    tooltip: {
      slots: {
        content: 'rounded-lg bg-inverted shadow-none text-inverted ring-0',
        arrow: 'fill-inverted'
      }
    },
    avatar: {
      slots: {
        root: 'outline -outline-offset-1 outline-black/10 dark:outline-white/10'
      }
    },
    dropdownMenu: {
      slots: {
        itemLeadingIcon: 'size-4',
        itemTrailingIcon: 'size-4',
        viewport: 'divide-neutral-100 dark:divide-white/5',
        content: 'rounded-lg',
        group: 'p-0.5'
      }
    },
    modal: {
      variants: {
        fullscreen: {
          false: {
            content: 'rounded-xl'
          }
        }
      }
    }
  }
})
