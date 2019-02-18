module.exports = () => {
    const getMessage = (sqlError, args) => {
        const sourceItem = args.source;
        const childItem = args.child;
        switch (sqlError.errno) {
            case 1451: 
                return `Unable to delete ${sourceItem} due to being referenced by ${childItem} element.`
        }
    };
    return {
        getMessage
    };
}