type TreeFilter = (o: any) => boolean | any;

/**
* Finds a value, subobject, or array from a tree that matches a specific filter.
* @param tree Tree that should be walked
* @param searchFilter Filter to check against each object and subobject
* @param options Additional options to customize the search
* @param options.walkable Array of strings to use as keys that are allowed to be walked on. Null value indicates all keys are walkable
* @param options.ignore Array of strings to use as keys to exclude from the search, most helpful when `walkable = null`.
*/
export default function findInTree(tree: Record<string|number, unknown> | null, searchFilter: TreeFilter | string, {walkable = null, ignore = []}: {walkable?: string[] | null, ignore?: string[]} = {}): any | undefined {
   if (typeof searchFilter === "string") {
       if (tree?.hasOwnProperty(searchFilter)) return tree[searchFilter];
   }
   else if (searchFilter(tree)) {
       return tree;
   }

   if (typeof tree !== "object" || tree == null) return undefined;

   let tempReturn: unknown;
   if (tree instanceof Array) {
       for (const value of tree) {
           tempReturn = findInTree(value, searchFilter, {walkable, ignore});
           if (typeof tempReturn != "undefined") return tempReturn;
       }
   }
   else {
       const toWalk = walkable == null ? Object.keys(tree) : walkable;
       for (const key of toWalk) {
           if (typeof (tree[key]) == "undefined" || ignore.includes(key)) continue;
           tempReturn = findInTree(tree[key] as Record<string|number, unknown>, searchFilter, {walkable, ignore});
           if (typeof tempReturn != "undefined") return tempReturn;
       }
   }
   return tempReturn;
}