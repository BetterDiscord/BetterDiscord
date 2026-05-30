export type NestedKeyOf<ObjectType extends object> =
    {[Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
        ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
        : `${Key}`
    }[keyof ObjectType & (string | number)];