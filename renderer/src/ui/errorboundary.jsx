import Logger from "common/logger";
import { React, Strings, WebpackModules } from "modules";

const Text = WebpackModules.getByDisplayName("Text");

let reactErrors;
fetch(
	"https://raw.githubusercontent.com/facebook/react/master/scripts/error-codes/codes.json"
)
	.then((response) => response.json())
	.then((body) => {
		reactErrors = body;
	});

export default class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			hasError: false,
		};
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, info) {
		this.setState({ hasError: true, error, info }, () => {
			this.props.onError?.(this.state);
		});
	}

	render() {
		if (this.state.hasError) {
			const Fallback = this.props.fallback ?? false;
			Logger.log(Fallback);
			if (Fallback) {
				return (
					<ErrorBoundary
						fallback={() => (
							<ErrorBoundary
								fallback={() => (
									<ErrorBoundary>
										{Strings.Addons.errorBoundaryErrorError}
									</ErrorBoundary>
								)}
							>
								<Text>{Strings.Addons.errorBoundaryError}</Text>
							</ErrorBoundary>
						)}
					>
						<Fallback />
					</ErrorBoundary>
				);
			}
			return null;
		}
		return this.props.children;
	}
}

// const originalRender = ErrorBoundary.prototype.render;
// Object.defineProperty(ErrorBoundary.prototype, "render", {
// 	enumerable: false,
// 	configurable: false,
// 	set: function () {
// 		Logger.warn(
// 			"ErrorBoundary",
// 			"Addon policy for plugins #5 https://github.com/rauenzi/BetterDiscordApp/wiki/Addon-Policies#plugins"
// 		);
// 	},
// 	get: () => originalRender,
// });
