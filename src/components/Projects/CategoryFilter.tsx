type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
  sticky?: boolean;
};

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
  sticky = true,
}: CategoryFilterProps) {
  return (
    <div
      className={`projects-filter${sticky ? " projects-filter--sticky" : ""}`}
      role="toolbar"
      aria-label="Filtra i progetti per categoria"
    >
      {categories.map((category) => {
        const isActive = selectedCategory === category;

        return (
          <button
            key={category}
            type="button"
            className={`projects-filter__button${isActive ? " is-active" : ""}`}
            aria-pressed={isActive}
            onClick={() => onSelect(category)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
