
export default class TimeError extends Error {
    private error: Error;

    public constructor(props: any, error: Error) {
        super(props);
        this.error = error;
    }

    public getError(): Error {
        return this.error;
    }
}