export const carouselThemeConfig = {
  root: {
    base: "relative h-full w-full",
    leftControl: "hidden",
    rightControl: "hidden",
  },
  scrollContainer: {
    base: "flex h-full w-full overflow-x-hidden overflow-y-hidden scroll-smooth rounded-xl",
    snap: "snap-x snap-mandatory",
  },
  item: {
    base: "relative block h-full w-full",
    wrapper: {
      on: "w-full shrink-0 snap-center",
      off: "w-full shrink-0 snap-center",
    },
  },
//   indicators: {
//     wrapper: "absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2",
//     base: "h-2 w-2 rounded-full",
//     active: { on: "bg-white", off: "bg-white/50" },
//   },
  control: {
    base: "hidden",
    icon: "",
  },
};
