import { DownloadOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Empty,
  Image,
  notification,
  PageHeader,
  Skeleton,
} from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./App.scss";
import aniq from "./assets/aniq.png";
import { AnimeQuote } from "./models/models";

const openErrorNotification = (errorMessage: string) => {
  notification.error({
    message: errorMessage,
  });
};

const openSuccessNotification = (successMessage: string) => {
  notification.success({
    message: successMessage,
  });
};

interface QuoteContentProps {
  readonly quote: AnimeQuote | undefined;
  readonly t: any;
}

const QuoteContent = (props: QuoteContentProps) => {
  if (props?.quote) {
    return (
      <div className="quote-content">
        <div>
          <strong>{`${props.t("quote.anime")} `}</strong>
          <span>{props.quote?.anime ?? ""}</span>
        </div>
        <div>
          <strong>{`${props.t("quote.character")} `}</strong>
          <span>{props.quote?.character ?? ""}</span>
        </div>
        <div>
          <strong>{`${props.t("quote.quote")} `}</strong>
          <span>{props.quote?.quote ?? ""}</span>
        </div>
      </div>
    );
  } else {
    return (
      <div className="quote-content">
        <Empty description={props.t("alert.no_quote")} />
      </div>
    );
  }
};

function App() {
  const [gettingQuote, setGettingQuote] = useState(false);
  const [quote, setQuote] = useState<AnimeQuote>();
  const [promptInstall, setPromptInstall] = useState<any>();
  const [isOnline, setIsOnline] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // Listen to installation event
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setPromptInstall(e);
    });

    window.addEventListener("appinstalled", () => {
      setPromptInstall(undefined);
      openSuccessNotification(t("notification.install_succeed"));
    });

    // Set online status when rendering the component
    setIsOnline(navigator.onLine);

    // Try to get a new Anime quote
    handleGetQuote();

    // return () => window.removeEventListener("transitionend", handler);
  }, []);

  const handleInstall = () => {
    if (promptInstall) {
      promptInstall.prompt();
      promptInstall.userChoice.then((choice: any) => {
        if (choice.outcome !== "accepted") {
          openErrorNotification(t("notification.install_denied"));
        }
      });
    } else {
      openErrorNotification(t("notification.install_failed"));
    }
  };

  const handleGetQuote = () => {
    setGettingQuote(true);
    fetch("https://animechan.vercel.app/api/random")
      .then((res) => res.json())
      .then(
        (result: AnimeQuote) => {
          setGettingQuote(false);
          setQuote(result);
        },
        (error) => {
          setGettingQuote(false);
          openErrorNotification(t("notification.get_quote_failed"));
        }
      );
  };

  return (
    <div className="App">
      <div className="App-header">
        <PageHeader
          className="site-page-header"
          title={t("app_short_name")}
          extra={
            promptInstall && [
              <Button
                type="primary"
                shape="round"
                icon={<DownloadOutlined />}
                onClick={handleInstall}
              >
                {t("install")}
              </Button>,
            ]
          }
        />
        <Image preview={false} src={aniq} />
      </div>
      <div className="App-content">
        {gettingQuote ? <Skeleton /> : QuoteContent({ quote, t })}
      </div>
      <div className="App-footer">
        {isOnline ? (
          <Button
            loading={gettingQuote}
            type="primary"
            onClick={handleGetQuote}
          >
            {gettingQuote ? t("getting_quote") : t("get_quote")}
          </Button>
        ) : (
          <Alert message={t("alert.no_connection")} type="warning" showIcon />
        )}
      </div>
    </div>
  );
}

export default App;
